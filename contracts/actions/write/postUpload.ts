import { veridocAction, veridocState, ContractResult } from '../../types/types';

declare const ContractError;

export const postUpload = (
  state: veridocState,
  { caller, input: { walletAddress,txId } }: veridocAction
): ContractResult => {
  const uploads = state.uploads;
  
  const id = uploads.length + 1;

  state.uploads.push({
    id,
    walletAddress,
    txId
  });

  return { state };
};
