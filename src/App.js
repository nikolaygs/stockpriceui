import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import parse from "html-react-parser";
import configData from "./config.json";

import ResultPanel from "./components/ResultPanel";
import DateTimePicker from "./components/DateTimePicker";
import AmountField from "./components/AmountField";
import StockSymbolField from "./components/StockSymbolField";


export default function MaxProfitForm() {
  const fetch = require('fetch-retry')(global.fetch);

  // React boostrap alert variants used
  const variantSuccess = "success";
  const variantInfo = "info";
  const variantError = "danger";

  // Form validation status
  const [validated, setValidated] = useState(false);

  // Field values
  const [beginPoint, setBeginPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [amount, setAmount] = useState(0.0);
  const [stock, setStock] = useState("");

  // Result panel status fields
  const [showResultPanel, setShowResultPanel] = useState(false);
  const [variantResultPanel, setVariantResultPanel] = useState("");
  const [messageResultPanel, setMessageResultPanel] = useState("");

  // Updates state upon change in any of the form input fields
  function onFieldChange(event) {
    switch (event.target.id) {
      case "begin":
        setBeginPoint(event.target.value);
        break;
      case "end":
        setEndPoint(event.target.value);
        break;
      case "amount":
        setAmount(event.target.value);
        break;
      case "stock":
        setStock(event.target.value);
        break;
      default:
        console.error("Unrecognized event.target id", id);
    }
  }

  // Handling of the form submission - it does two things:
  // 1. Performs a client-side validation
  // 2. Fires server request (if the validation passes)
  function handleSubmit(event) {
    const form = event.currentTarget;
    if (form.checkValidity() === true) {
      getMaxProfit();
    }

    event.preventDefault();
    event.stopPropagation();
    setValidated(true);
  }

  // Builds URL with query params and calls the server using fetch API
  function getMaxProfit() {
    // convert to seconds
    const beginSeconds = Date.parse(beginPoint) / 1000;
    const endSeconds = Date.parse(endPoint) / 1000;

    console.log(`http://${configData.SERVER_HOST}:${configData.SERVER_PORT}/maxprofit?symbol=${stock}&begin=${beginSeconds}&end=${endSeconds}`)
    // params are passed as query params
    fetch(
      `http://${configData.SERVER_HOST}:${configData.SERVER_PORT}/maxprofit?symbol=${stock}&begin=${beginSeconds}&end=${endSeconds}`,
      {
        retries: 3,
        retryOn: [429, 500, 503],
        retryDelay: function (attempt, error, response) {
          return Math.pow(2, attempt) * 1000; // 1 sec, 2 sec, 4 sec
        }
      }
    )
      .then((r) => r.json().then((data) => ({ status: r.status, body: data })))
      .then((data) => processResult(data))
      .catch((error) => onError(error));
  }

  // Updates the status of the result panel based on the response received from the server.
  // The panel supports 3 states
  // 1. Max profit points were returned by the server and the panel displays "friendly" message to the user
  // 2. Server returned 4XX retuest - panel renders the cause so client can fix its request
  // 3. Any other error - generic message that server failed to process the request is displayed
  function processResult(data) {
    console.log("Success")

    if (data.status == 200) {
      if (!validateSuccessResponse(data.body)) {
        setResultPanelProps(variantError, "Failed to parse the response returned by the server");
      } else {
        setResultPanelProps(variantSuccess, profitMessage(data.body));
      }
    } else if (data.status == 404 || data.status == 400) {
      if (!Object.hasOwn(data.body, "message")) {
        setResultPanelProps(variantError, "Failed to parse the error message returned by the server");
      } else {
        setResultPanelProps(variantInfo, data.body.message);
      }
    } else {
      setResultPanelProps(variantError, "The server failed to return a response");
    }

    setShowResultPanel(true);
    return data;
  }

  // Displays error message if the fetch processing fails unexpectedly
  function onError(error) {
    setResultPanelProps(variantError, "The server failed to return a response");
    setShowResultPanel(true);
  }

  // Helper function that sets state fields of ResultRanel
  function setResultPanelProps(variant, message) {
    setVariantResultPanel(variant);
    setMessageResultPanel(message);
  }

  // Gnerates an user-"friendly" message about the max possible profit
  function profitMessage(data) {
    const shares = amount / data.buyPoint.price;
    const maxProfit = (data.sellPoint.price - data.buyPoint.price) * shares;

    return parse(`
      <b>${maxProfit.toFixed(2)}$</b> is the maximum profit that you could have earned
      in the period from <b>${beginPoint}</b> to <b>${endPoint}</b> by trading stock <b>${stock}</b>.
      <p>
      This could have been achieved if you have bought <b>${shares.toFixed(2)}</b> of shares
      on <b>${data.buyPoint.date}</b> and sold them on <b>${data.sellPoint.date}</b>
      </p>
     `);
  }


  // Probably not very idiomatic approach - static typing(TS) would be way more elegant solution
  function validateSuccessResponse(resp) {
    if (!Object.hasOwn(resp, "buyPoint") || !Object.hasOwn(resp, "sellPoint")) {
      return false;
    }

    if (!Object.hasOwn(resp.buyPoint, "price") || !Object.hasOwn(resp.buyPoint, "date")) {
      return false;
    }

    if (!Object.hasOwn(resp.sellPoint, "price") || !Object.hasOwn(resp.sellPoint, "date")) {
      return false;
    }

    return true;
  }

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit} data-testid="form">
      <StockSymbolField onChange={onFieldChange} />
      <DateTimePicker title="Begin date" id="begin" onChange={onFieldChange} />
      <DateTimePicker title="End date" id="end" onChange={onFieldChange} />
      <AmountField onChange={onFieldChange} />

      <ResultPanel
        setShow={setShowResultPanel}
        show={showResultPanel}
        variant={variantResultPanel}
        message={messageResultPanel}
      />
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
}
