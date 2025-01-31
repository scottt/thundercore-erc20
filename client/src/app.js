import Web3 from "Web3";
import TruffleContract from "truffle-contract";

import $ from "jquery";

// If you change the name of contract, make sure you set the right reference here
import TutorialTokenArtifact from "../contracts/MyToken.json";

const App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: async function() {
    if (window.ethereum) {
      try {
        App.web3Provider = web3.currentProvider;
        web3 = new Web3(ethereum);
        await ethereum.enable();
      } catch (e) {
        console.error(e);
        $content.find("#error-message").text("Need to request account access.");
        return;
      }
    }
    // Initialize web3 and set the provider to the testRPC.
    else if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://127.0.0.1:9545"
      );
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    // Get the necessary contract artifact file and instantiate it with truffle-contract.
    App.contracts.TutorialToken = TruffleContract(TutorialTokenArtifact);

    // Set the provider for our contract.
    App.contracts.TutorialToken.setProvider(App.web3Provider);

    // Use our contract to retieve and mark the adopted pets.
    App.getBalances();

    App.bindEvents();
  },

  bindEvents: function() {
    $(document).on("click", "#transfer-button", App.handleTransfer);
  },

  handleTransfer: function(event) {
    event.preventDefault();
    App.openLoading();

    const amount = parseInt($("#transfer-amount").val());
    const toAddress = $("#transfer-address").val();

    console.log("Transfer " + amount + " MT to " + toAddress);

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.TutorialToken.deployed()
        .then(function(instance) {
          return instance.transfer(toAddress, amount, {
            from: account,
            gas: 100000
          });
        })
        .then(function(result) {
          const $content = $($("#success-alert").html());
          $content.find("#success-message").text(`Transaction ${result.tx}`);
          $content.appendTo("#alert-slot");

          return App.getBalances();
        })
        .catch(function(err) {
          console.log(err.message);
          const $content = $($("#failed-alert").html());
          $content.find("#error-message").text(err.message);
          $content.appendTo("#alert-slot");
          App.closeloading();
        });
    });
  },

  getBalances: function() {
    console.log("Getting balances...");

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      const account = accounts[0];

      App.contracts.TutorialToken.deployed()
        .then(function(instance) {
          return instance.balanceOf(account);
        })
        .then(function(result) {
          const balance = result.toNumber();

          $("#MY-balance").text(balance);
        })
        .catch(function(err) {
          console.log(err.message);
        })
        .finally(function() {
          App.closeloading();
        });
    });
  },

  closeloading: function() {
    $("#overlay")
      .removeClass("d-flex")
      .addClass("d-none");
  },

  openLoading: function() {
    $("#overlay")
      .removeClass("d-none")
      .addClass("d-flex");
  }
};

$(window).on("load", function() {
  App.init();
});
