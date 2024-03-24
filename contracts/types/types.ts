export interface veridocState {
  uploads: Upload[];
}

interface Upload {
  id: number;
  walletAddress: string;
  txId: string;
}

export interface veridocAction {
  input:veridocInput;
  caller: string;
}

export interface veridocInput {
  function:veridocFunction;
  walletAddress: string;
  txId: string;
}

export type veridocResult = Upload;

export type veridocFunction = 'postUpload' ;

export type ContractResult = { state: veridocState } | { result:veridocResult };
