import { useEffect, useState } from "react";
import { Switch, Route } from "react-router-dom";
import Home from "./pages/home";
import "./App.css";
import Web3 from "web3";
import { contractAbi, contractAddress } from "./config";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InformationModal from "./components/informationModal";
import ConfirmationLoadingPopup from "./components/confirmationLoadingPopup";

const App = () => {
  const [chainId, setChainId] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [totalSupply, setTotalSupply] = useState(0);
  const [maxSupply, setMaxSupply] = useState(0);
  const [price, setPrice] = useState(0);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [lessMintAmountAlert, setLessMintAmountAlert] = useState(false);
  const [accessAccountDenied, setAccessAccountDenied] = useState(false);
  const [installEthereum, setInstallEthereum] = useState(false);
  const [nftMinted, setNftMinted] = useState(false);
  const [nftMinting, setNftMinting] = useState(false);
  const [transactionRejected, setTransactionRejected] = useState(false);
  const [transactionFailed, setTransactionFailed] = useState(false);
  const [switchToMainnet, setswitchToMainnet] = useState(false);
  const [ethereumCompatibleBrowser, setEthereumCompatibleBrowser] =
    useState(false);
  const [mintingInProgress, setMintingInProgress] = useState(false);
  const [confirmTransaction, setConfirmTransaction] = useState(false);
  const [saleLive, setSaleLive] = useState(false);

  async function loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        loadBlockchainData();
        getCurrentAddressConnected();
        addAccountsAndChainListener();
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      } catch (error) {
        if (error.code === 4001) {
          // swal("Request to access account denied!", "", "error");
          setAccessAccountDenied(true);
        } else console.error(error);
      }
    } else {
      // swal(
      //   "",
      //   "Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!",
      //   "error"
      // );
      setInstallEthereum(true);
    }
  }

  useEffect(() => {
    loadWeb3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log("price", price);

  const loadBlockchainData = async () => {
    const contract = new window.web3.eth.Contract(contractAbi, contractAddress);
    setContract(contract);
    const chainId = await window.web3.eth.getChainId();
    setChainId(chainId);
    //success when chainId = 4 else failure
    // you are connected to main net
    // Please connect to main net

    if (chainId === 4) {
      toast(`You are connected to main net`, {
        type: "success",
        position: toast.POSITION.BOTTOM_CENTER,
      });
      const totalSupply = await contract.methods.totalSupply().call();
      setTotalSupply(totalSupply);

      const price = await contract.methods.getPrice().call();
      setPrice(price);
      const displayPrice = window.web3.utils.fromWei(price, "ether");
      setDisplayPrice(displayPrice);
      const MAX_SUPPlY = await contract.methods.MAX_SUPPlY().call();
      // console.log("MAX_SUPPLY:", MAX_SUPPlY);
      setMaxSupply(MAX_SUPPlY);

      //event will be fired by the smart contract when a new NFT is minted
      contract.events
        .NFTMinted()
        .on("data", async function (result) {
          setTotalSupply(result.returnValues[0]);
        })
        .on("error", console.error);
    } else {
      toast("Please connect to main net", {
        type: "error",
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }
  };

  const getCurrentAddressConnected = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addAccountsAndChainListener = async () => {
    //this event will be emitted when the currently connected chain changes.
    window.ethereum.on("chainChanged", (_chainId) => {
      window.location.reload();
    });

    // this event will be emitted whenever the user's exposed account address changes.
    window.ethereum.on("accountsChanged", (accounts) => {
      window.location.reload();
    });
  };

  async function mint(mintCount) {
    if (contract) {
      if (chainId === 4) {
        const saleOpen = await contract.methods.saleOpen().call();
        if (saleOpen) {
          if (mintCount === 0) {
            setLessMintAmountAlert(true);
          } else {
            setConfirmTransaction(true);
            const finalPrice = Number(price) * mintCount;
            contract.methods
              .mintNFT(mintCount)
              .send({ from: account, value: finalPrice })
              .on("transactionHash", function () {
                // swal({
                //   title: "Minting NFT!",
                //   icon: "info",
                // });
                setConfirmTransaction(false);
                setMintingInProgress(true);
              })
              .on("confirmation", function () {
                const el = document.createElement("div");
                el.innerHTML =
                  "View minted NFT on OpenSea : <a href='https://testnets.opensea.io/account '>View Now</a>";

                // swal({
                //   title: "NFT Minted!",
                //   content: el,
                //   icon: "success",
                // });
                setNftMinted(true);
                setConfirmTransaction(false);
                setMintingInProgress(false);
                setTimeout(() => {
                  window.location.reload(false);
                }, 5000);
              })
              .on("error", function (error, receipt) {
                if (error.code === 4001) {
                  // swal("Transaction Rejected!", "", "error");
                  setTransactionRejected(true);
                  setConfirmTransaction(false);
                  setMintingInProgress(false);
                } else {
                  // swal("Transaction Failed!", "", "error");
                  setTransactionFailed(true);
                  setConfirmTransaction(false);
                  setMintingInProgress(false);
                }
              });
          }
        } else {
          setSaleLive(true);
        }
      } else {
        setswitchToMainnet(true);
      }
    } else {
      // swal(
      //   "",
      //   "Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!",
      //   "error"
      // );
      setEthereumCompatibleBrowser(true);
    }
  }

  return (
    <>
      <Switch>
        <Route
          exact
          path="/"
          render={(props) => (
            <Home
              account={account}
              mint={mint}
              totalSupply={totalSupply}
              displayPrice={displayPrice}
              loadWeb3={loadWeb3}
              maxSupply={maxSupply}
            />
          )}
        />
      </Switch>
      <InformationModal
        open={saleLive}
        onClose={setSaleLive}
        title=" Sale is not live"
        text="Sale is not live yet. Please follow our discord for the updates"
      />
      <InformationModal
        open={lessMintAmountAlert}
        onClose={setLessMintAmountAlert}
        title="Oops"
        text="Atleast 1 Coochycoo Panda should be minted"
      />
      <InformationModal
        open={accessAccountDenied}
        onClose={setAccessAccountDenied}
        title="Oops"
        text="Request to access account denied!"
      />
      <InformationModal
        open={installEthereum}
        onClose={setInstallEthereum}
        title="Oops"
        text="Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!"
      />
      <InformationModal
        open={nftMinted}
        onClose={setNftMinted}
        title="Mint Successful"
        text="Thank you for the purchase. Your NFT will be available on OpenSea shortly"
      />
      <InformationModal
        open={nftMinting}
        onClose={setNftMinting}
        title="Information"
        text="Minting NFT!"
      />
      <InformationModal
        open={transactionRejected}
        onClose={setTransactionRejected}
        title="Error"
        text="Transaction Rejected!"
      />
      <InformationModal
        open={transactionFailed}
        onClose={setTransactionFailed}
        title="Error"
        text="Transaction Failed!"
      />
      <InformationModal
        open={switchToMainnet}
        onClose={setswitchToMainnet}
        title="Error"
        text="Please switch to mainnet to mint Coochycoo Panda"
      />
      <InformationModal
        open={ethereumCompatibleBrowser}
        onClose={setEthereumCompatibleBrowser}
        title="Error"
        text="Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!"
      />
      <ConfirmationLoadingPopup
        open={confirmTransaction}
        title="Confirm Transaction"
        message="Confirm transaction to mint the NFT"
      />
      <ConfirmationLoadingPopup
        open={mintingInProgress}
        title="Minting In Progress"
        message="Please wait to get confirmation of the transaction from blockchain"
      />
    </>
  );
};

export default App;
