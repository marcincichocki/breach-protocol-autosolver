import { capitalize } from '@/common';
import {
  BreachProtocolBufferSizeFragment,
  BreachProtocolDaemonsFragment,
  BreachProtocolFragment,
  BreachProtocolFragmentOptions,
  BreachProtocolGridFragment,
  BreachProtocolTypesFragment,
  Fragment,
  FragmentId,
  FragmentOptions,
  FRAGMENTS,
} from './fragments';
import { ImageContainer } from './image-container';
import { BreachProtocolRecognizer } from './recognizer';
import { BreachProtocolRecognitionResult } from './result';

export interface BreachProtocolOCROptions extends FragmentOptions {
  thresholdGrid?: number;
  thresholdGridAuto: boolean;
  thresholdDaemons?: number;
  thresholdDaemonsAuto: boolean;
  thresholdTypes?: number;
  thresholdTypesAuto: boolean;
  thresholdBufferSize?: number;
  thresholdBufferSizeAuto: boolean;
  skipTypesFragment?: boolean;
  useFixedBufferSize?: boolean;
  fixedBufferSize?: number;
  patch: '1.x' | '2.x';
}

type FragmentCtor = new (
  ...args: ConstructorParameters<typeof BreachProtocolFragment>
) => Fragment;

class BreachProtocolFragmentFactory<TImage> {
  private static readonly fragmentCtorMap = new Map<FragmentId, FragmentCtor>([
    [FragmentId.Grid, BreachProtocolGridFragment],
    [FragmentId.Daemons, BreachProtocolDaemonsFragment],
    [FragmentId.Types, BreachProtocolTypesFragment],
    [FragmentId.BufferSize, BreachProtocolBufferSizeFragment],
  ]);

  constructor(
    private readonly container: ImageContainer<TImage>,
    private readonly recognizer: BreachProtocolRecognizer,
    private readonly options: BreachProtocolOCROptions
  ) {}

  create(id: FragmentId) {
    const FragmentCtor = this.getFragmentCtor(id);
    const options = this.getFragmentOptions();

    if (FragmentCtor) {
      return new FragmentCtor(this.container, options);
    }

    return null;
  }

  private getFragmentCtor(id: FragmentId) {
    if (id === FragmentId.BufferSize && this.options.useFixedBufferSize) {
      return null;
    }

    if (id === FragmentId.Types && this.options.skipTypesFragment) {
      return null;
    }

    return BreachProtocolFragmentFactory.fragmentCtorMap.get(id)!;
  }

  private getFragmentOptions(): BreachProtocolFragmentOptions {
    const { recognizer, options } = this;
    const {
      filterRecognizerResults,
      extendedDaemonsAndTypesRecognitionRange,
      extendedBufferSizeRecognitionRange,
      patch,
    } = options;

    return {
      recognizer,
      extendedBufferSizeRecognitionRange,
      extendedDaemonsAndTypesRecognitionRange,
      filterRecognizerResults,
      patch,
    };
  }
}

function getFixedThresholdFor<T extends FragmentId>(
  id: T,
  options: BreachProtocolOCROptions
) {
  const thresholdKey = `threshold${capitalize(id)}` as const;
  const thresholdAutoKey = `${thresholdKey}Auto` as const;

  const { [thresholdKey]: threshold, [thresholdAutoKey]: thresholdAuto } =
    options;

  return thresholdAuto ? undefined : threshold;
}

async function reduceFragmentsToResult(
  fragments: Fragment[],
  options: BreachProtocolOCROptions
) {
  const pendingResults = fragments.map((fragment) => {
    if (fragment) {
      const threshold = getFixedThresholdFor(fragment.id, options);

      return fragment.recognize(threshold);
    }

    return null;
  });
  const results = await Promise.all(pendingResults);

  return new BreachProtocolRecognitionResult(results);
}

export async function breachProtocolOCR<TImage>(
  container: ImageContainer<TImage>,
  recognizer: BreachProtocolRecognizer,
  options: BreachProtocolOCROptions
) {
  const factory = new BreachProtocolFragmentFactory(
    container,
    recognizer,
    options
  );
  const fragments = FRAGMENTS.map((id) => factory.create(id));

  return reduceFragmentsToResult(fragments, options);
}
