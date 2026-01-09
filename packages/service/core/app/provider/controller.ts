import { loadModelProviders } from '../../../thirdProvider/fastgptPlugin/model';
import {
  type langType,
  defaultProvider,
  formatModelProviders
} from '@fastgpt/global/core/ai/provider';
import type { I18nStringStrictType } from '@fastgpt/global/sdk/fastgpt-plugin';

// Local providers that should always be available (e.g., Ollama for local models)
const localProviders: { provider: string; value: I18nStringStrictType; avatar: string }[] = [
  {
    provider: 'Ollama',
    value: {
      en: 'Ollama',
      'zh-CN': 'Ollama',
      'zh-Hant': 'Ollama'
    },
    avatar: 'model/ollama'
  }
];

// Preload model providers
export async function preloadModelProviders(): Promise<void> {
  const { modelProviders, aiproxyIdMap } = await loadModelProviders();

  // Merge local providers with remote providers (local providers take precedence)
  const existingProviderIds = new Set(modelProviders.map((p) => p.provider));
  const mergedProviders = [
    ...modelProviders,
    ...localProviders.filter((p) => !existingProviderIds.has(p.provider))
  ];

  const { ModelProviderListCache, ModelProviderMapCache } = formatModelProviders(mergedProviders);
  global.ModelProviderRawCache = mergedProviders;
  global.ModelProviderListCache = ModelProviderListCache;
  global.ModelProviderMapCache = ModelProviderMapCache;

  global.aiproxyIdMapCache = aiproxyIdMap;
}

export const getModelProviders = (language = 'en') => {
  return global.ModelProviderListCache[language as langType] || [];
};
export const getModelProvider = (provider?: string, language = 'en') => {
  if (!provider) {
    return defaultProvider;
  }

  return global.ModelProviderMapCache[language as langType][provider] ?? defaultProvider;
};
