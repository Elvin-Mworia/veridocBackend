(() => {
  // contracts/actions/write/postUpload.ts
  var postUpload = (state, { caller, input: { walletAddress, txId } }) => {
    const uploads = state.uploads;
    const id = uploads.length + 1;
    state.uploads.push({
      id,
      walletAddress,
      txId
    });
    return { state };
  };

  // contracts/contract.ts
  function handle(state, action) {
    const input = action.input;
    switch (input.function) {
      case "postUpload":
        return postUpload(state, action);
      default:
        throw new ContractError(`No function supplied or function not recognised: "${input.function}"`);
    }
  }
})();
