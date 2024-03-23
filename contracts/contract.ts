import { ContractResult, veridocAction, veridocResult, veridocState } from './types/types';
import { postUpload} from './actions/write/postUpload';

declare const ContractError;

export function handle(state: veridocState, action: veridocAction): ContractResult {
  const input = action.input;

  switch (input.function) {
    case 'postUpload':
      return postUpload(state, action);
    default:
      throw new ContractError(`No function supplied or function not recognised: "${input.function}"`);
  }
}
