/* eslint-disable react/jsx-no-target-blank */
import React from "react";
import { withStyles } from "@material-ui/core";
import logo from "../../assets/Logo.png";
import Slider from "@material-ui/core/Slider";
import logotopbrimg from "../../assets/topbrimg.png";
import "./topSection.css";
import { Button } from "@material-ui/core";

const PrettoSlider = withStyles({
  // eslint-disable-next-line no-unused-vars
  root: {
    color: "#fd4f54",
    width: "100%",
    height: 8,
    marginTop: "50px",
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: "#fff",
    border: "2px solid #fd4f54",
    marginTop: -8,
    marginLeft: -12,
    "&:focus, &:hover, &$active": {
      boxShadow: "inherit",
    },
  },
  active: {},
  valueLabel: {
    left: "calc(-50% + 4px)",
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fd4f54",
  },
  rail: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
})(Slider);

const TopSection = ({
  mint,
  totalSupply,
  price,
  account,
  loadWeb3,
  maxSupply,
}) => {
  const [value, setValue] = React.useState(1);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <div className="topsection-main-wrapper">
      <div className="topsection-inner-wrapper">
        <div className="top-logo-wrapper">
          <img src={logo} alt="logo" />
        </div>
        <div className="topsection-bootom-box-wrapper">
          <div className="topsection-bootom-inner-box-wrapper">
            <div className="topb-left-wrapper">
              <div className="buy-nowbtn-wrapper">
                <button onClick={() => loadWeb3()}>
                  {account
                    ? account.slice(0, 8) +
                      "..." +
                      account.slice(account.length - 5)
                    : "CONNECT WALLET"}
                </button>
              </div>

              <div className="topsection-slider-wrapper">
                <PrettoSlider
                  value={value}
                  min={1}
                  step={1}
                  max={5}
                  valueLabelDisplay="auto"
                  aria-label="pretto slider"
                  defaultValue={5}
                  onChange={handleChange}
                  className="slidercustome"
                />
              </div>

              <p className="slider-below-text">
                Buy {value} Coochycoo Panda{" "}
                <span className="big-font">
                  {(value * price).toFixed(4)} Ether
                </span>
              </p>

              <div className="mint-buton-wrapper">
                <Button
                  variant="contained"
                  color="secondary"
                  className="muiBtn"
                  onClick={() => {
                    mint(value);
                  }}
                  style={
                    !account || totalSupply === 2000
                      ? {
                          backgroundColor: "grey",

                          cursor: "default",

                          fontFamily: '"Poppins", sans-serif',
                        }
                      : null
                  }
                  disabled={!account ? true : false}
                >
                  {totalSupply === 2000 ? "All Sold" : "Buy Coochycoo Panda"}
                </Button>
                <br />
                <span
                  style={
                    !account
                      ? {
                          color: "#fff",
                          marginTop: "5px",
                          display: "inline-block",
                          fontFamily: '"Poppins", sans-serif',
                        }
                      : { display: "none" }
                  }
                >
                  Connect Wallet to Buy NFT
                </span>
              </div>

              <p>
                Total Coochycoo Panda Sold{" "}
                <span className="linebreak">
                  {totalSupply}/{maxSupply}
                </span>
              </p>
              <br />
              <br />
              <br />
            </div>
            <div className="topb-right-wrapper">
              <img src={logotopbrimg} alt="logotopbrimg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopSection;
