import { KeyBind, KeyBindProps, Transformer } from './KeyBind';

const shallowTransformer: Transformer = {
  toUniversal(input: string) {
    return [input];
  },
  fromUniversal(output: string[]) {
    return output[0];
  },
};

export const ShallowKeyBind = (props: Partial<KeyBindProps>) => {
  return <KeyBind {...props} transformer={shallowTransformer} depth={1} />;
};
