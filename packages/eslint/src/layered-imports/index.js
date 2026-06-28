import path from 'path';

import { debug } from './lib/debug.js';
import { applyForwardMappings } from './lib/mapping-applier.js';
import { compileMappings } from './lib/mapping-compiler.js';
import { compileLayers, findEnclosingModule } from './lib/module-resolver.js';
import { classifyImport } from './lib/path-classifier.js';
import {
  denormalizeToRelative,
  normalizeAliasedImport,
  normalizeRelativeImport,
  toPosixPath,
} from './lib/path-normalizer.js';
import { findProjectRoot } from './lib/project-root.js';

// ============================================================================
// ESLint Rule 본체: layered-imports
// ----------------------------------------------------------------------------
// Layer 기반 import 정책을 강제한다.
//   - 같은 module 내부 import → 상대 경로
//   - 서브 module(상위 module 디렉터리에 중첩)에서 상위 module로의 import → 상대 경로
//     (같은 feature 내부 참조. 역방향(상위→하위)·형제 서브 module 간은 아래 규칙이 금지)
//   - 다른 module 간 import (허용된 layer 방향)   → alias 절대 경로
//   - module에 속하지 않는 파일에서의 import → alias 절대 경로 (layer 무관)
//   - 같은 layer의 서로 다른 module 간 import → 금지
//     (해당 layer의 allowSameLayer=true면 허용)
//   - 하위 layer에서 상위 layer module을 import → 금지
//   (상위 = 배열 앞쪽 / 하위 = 배열 뒤쪽. 상위는 하위에만 의존 가능.)
// ============================================================================

/** @type {import('eslint').Rule.RuleModule} */
export const layeredImports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Layer 기반 import 정책을 강제한다. 같은 모듈 내부는 상대 경로, 모듈 간은 alias, layer 의존 방향은 상위 → 하위만 허용.',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          projectRoot: {
            type: 'string',
            description:
              '프로젝트 루트 절대 경로. 미지정 시 가장 가까운 package.json의 디렉토리를 사용.',
          },
          root: {
            type: 'string',
            description:
              'projectRoot 기준 상대 경로. 정규화·패턴 매칭의 실효 기준을 이 하위 디렉터리로 옮긴다. 모노레포에서 앱 디렉터리(예: "apps/web")를 지정하면 alias·layers 패턴을 앱 로컬 경로로 작성할 수 있다.',
          },
          alias: {
            type: 'array',
            description:
              '정규화 경로 ↔ alias 매핑. wildcard(*) 사용 가능. 예: { from: "apps/web/*", to: "@/*" }',
            items: {
              type: 'object',
              properties: {
                from: { type: 'string' },
                to: { type: 'string' },
              },
              required: ['from', 'to'],
              additionalProperties: false,
            },
          },
          layers: {
            type: 'array',
            description:
              "layer 배열. 각 layer는 { name, modules, allowSameLayer? } 객체. 모듈 패턴: 'X' = X 자체가 모듈, 'X/*' = X의 직접 자식 각각이 모듈. 같은 layer 모듈 간 import는 기본 금지(allowSameLayer=true로 허용), 상위 layer(앞 인덱스)는 하위 layer(뒤 인덱스)만 import 가능. 매칭은 큰 layer index부터 (아래부터) 스캔.",
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'layer를 식별하는 이름. 메시지에 표시되며 layer 간 중복 불가.',
                },
                modules: {
                  type: 'array',
                  description: '이 layer에 속하는 모듈 패턴들.',
                  items: {
                    oneOf: [
                      {
                        type: 'string',
                        description:
                          "'X' (X 자체가 모듈) 또는 'X/*' (X의 직접 자식 디렉터리가 각각 모듈)",
                      },
                      {
                        type: 'object',
                        properties: {
                          pattern: { type: 'string' },
                          exclude: { type: 'string' },
                        },
                        required: ['pattern'],
                        additionalProperties: false,
                      },
                    ],
                  },
                },
                allowSameLayer: {
                  type: 'boolean',
                  description: '이 layer 안 모듈 간 import를 허용할지 여부. 기본 false (금지).',
                },
              },
              required: ['name', 'modules'],
              additionalProperties: false,
            },
          },
        },
        required: ['alias', 'layers'],
        additionalProperties: false,
      },
    ],
    messages: {
      useAlias:
        "'{{importPath}}' 경로 대신 '{{fixedPath}}' alias 절대 경로를 사용하십시오. (모듈 경계 횡단)",
      useRelative:
        "'{{importPath}}' 경로 대신 '{{fixedPath}}' 상대 경로를 사용하십시오. (같은 모듈 내부)",
      sameLayerForbidden:
        "'{{layer}}' 레이어 내 모듈 간 import는 금지됩니다. (from '{{fromModule}}' → to '{{toModule}}', '{{importPath}}')",
      lowerToUpperForbidden:
        "하위 레이어 '{{fromLayer}}'에서 상위 레이어 '{{toLayer}}'로의 import는 금지됩니다. (from '{{fromModule}}' → to '{{toModule}}', '{{importPath}}')",
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const compiledMappings = compileMappings(options.alias || []);
    const { configs: compiledModules, layerOptions } = compileLayers(options.layers || []);

    const currentFileDir = path.dirname(context.filename);
    const projectRoot = options.projectRoot
      ? path.resolve(options.projectRoot)
      : findProjectRoot(currentFileDir);

    if (!projectRoot) {
      debug('create: project root not found', { currentFileDir });
      return {};
    }

    // root 옵션이 있으면 정규화·패턴 매칭 기준을 projectRoot 하위로 옮긴다.
    const effectiveRoot = options.root ? path.resolve(projectRoot, options.root) : projectRoot;

    const currentFileNormalized = toPosixPath(path.relative(effectiveRoot, context.filename));
    const fileModule = findEnclosingModule(currentFileNormalized, compiledModules);

    debug('create: context', {
      filename: context.filename,
      projectRoot,
      currentFileNormalized,
      fileModule,
      mappingCount: compiledMappings.length,
      moduleCount: compiledModules.length,
    });

    function checkSource(node) {
      if (!node.source || typeof node.source.value !== 'string') return;

      const importPath = node.source.value;
      let kind = classifyImport(importPath, compiledMappings);

      // root 사용 시: classifyImport가 external로 본 bare 경로라도, projectRoot 기준으로
      // 풀었을 때 effectiveRoot 하위면 in-project raw 경로로 인정한다(예: 'apps/web/lib/x').
      // effectiveRoot가 projectRoot의 하위일 때만 검사 — 그래야 외부 패키지(react 등)가
      // effectiveRoot 밖('../..')으로 빠져 제외된다. catch-all alias('*')와 함께 쓸 때
      // 외부 import 오탐 없이 raw 경로만 정규화하기 위한 핵심.
      let rawNormalized = null;
      if (kind === 'external' && effectiveRoot !== projectRoot) {
        const rel = toPosixPath(path.relative(effectiveRoot, path.resolve(projectRoot, importPath)));
        if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)) {
          kind = 'normalized';
          rawNormalized = rel;
        }
      }

      if (kind === 'external') {
        debug('skip: external', { importPath });
        return;
      }

      const normalized =
        kind === 'relative'
          ? normalizeRelativeImport(importPath, currentFileDir, effectiveRoot)
          : kind === 'aliased'
            ? normalizeAliasedImport(importPath, compiledMappings)
            : kind === 'normalized'
              ? (rawNormalized !== null ? rawNormalized : importPath)
              : null;

      if (!normalized) {
        debug('skip: cannot normalize', { importPath, kind });
        return;
      }

      const targetModule = findEnclosingModule(normalized, compiledModules, { includeSelf: true });

      const sameModule =
        fileModule !== null && targetModule !== null && fileModule.path === targetModule.path;

      // 중첩 module: targetModule이 fileModule을 감싸는 상위(조상) module이면, 서브 module →
      // 상위 module 참조다. 같은 feature 내부이므로 상대 경로로 허용한다.
      // (형제 서브 module 간·역방향(상위→하위)은 아래 layer 규칙이 그대로 금지한다.)
      const childToParent =
        fileModule !== null &&
        targetModule !== null &&
        !sameModule &&
        fileModule.path.startsWith(targetModule.path + '/');

      if (
        !sameModule &&
        !childToParent &&
        fileModule !== null &&
        targetModule !== null &&
        fileModule.layerIndex >= targetModule.layerIndex
      ) {
        const isSameLayer = fileModule.layerIndex === targetModule.layerIndex;
        const allowed = isSameLayer && layerOptions[fileModule.layerIndex]?.allowSameLayer === true;

        if (!allowed) {
          const layerMessageId = isSameLayer ? 'sameLayerForbidden' : 'lowerToUpperForbidden';
          const fromLayerName = layerOptions[fileModule.layerIndex].name;
          const toLayerName = layerOptions[targetModule.layerIndex].name;

          debug('report: layer violation', {
            importPath,
            normalized,
            fileModule,
            targetModule,
            layerMessageId,
          });

          context.report({
            node: node.source,
            messageId: layerMessageId,
            data: {
              importPath,
              layer: fromLayerName,
              fromLayer: fromLayerName,
              toLayer: toLayerName,
              fromModule: fileModule.path,
              toModule: targetModule.path,
            },
          });
          return;
        }
        // allowSameLayer=true: cross-module이지만 layer 위반 면제 → 아래 alias 규칙 적용
      }

      let targetPath;
      let messageId;
      if (sameModule || childToParent) {
        targetPath = denormalizeToRelative(normalized, currentFileDir, effectiveRoot);
        messageId = 'useRelative';
      } else {
        const aliased = applyForwardMappings(normalized, compiledMappings);
        if (!aliased) {
          debug('skip: no alias mapping for target', { importPath, normalized });
          return;
        }
        targetPath = aliased;
        messageId = 'useAlias';
      }

      if (targetPath === importPath) return;

      debug('report', {
        importPath,
        normalized,
        fileModule,
        targetModule,
        sameModule,
        targetPath,
      });

      context.report({
        node: node.source,
        messageId,
        data: { importPath, fixedPath: targetPath },
        fix(fixer) {
          const quote = node.source.raw ? node.source.raw[0] : "'";
          return fixer.replaceText(node.source, `${quote}${targetPath}${quote}`);
        },
      });
    }

    return {
      ImportDeclaration: checkSource,
      ExportNamedDeclaration: checkSource,
      ExportAllDeclaration: checkSource,
    };
  },
};
