"use client";
import RechargeInstructions from "@/components/RechargeInstructions";
import { TransferDrawer } from "@/components/transfer/TransferDrawer";
import { formatBalance } from "@/lib/functions";
import UsdtIcon from "@/public/images/icons/usdt_icon.png";
import {
  useFindUserByCustomerIdMutation,
  useSendMutation,
} from "@/redux/features/send/sendApi";
import { fetchBaseQueryError } from "@/redux/services/helpers";
import { Card } from "flowbite-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const TransferPage = () => {
  const router = useRouter();
  const { user } = useSelector((state: any) => state.auth);

  const transferData = [
    // <>
    // 	You must reach a trade volume of{' '}
    // 	<span className='text-red-500 font-bold'>{user?.trade_volume}$</span> to
    // 	be eligible for transfer. (This value reflects your personal trade
    // 	volume).
    // </>,
    "Minimum transfer amount is $10.",
    "You can transfer balance only to valid registered users of this platform.",
    "Once transferred, the balance cannot be reversed or refunded.",
    "Please double-check the Receiver’s User ID before confirming the transfer.",
    "A small transaction fee (if any) may be deducted from the transferred amount.",
    "You must have sufficient balance in your account before initiating the transfer.",
    "Suspicious or fraudulent transfers may result in temporary suspension of your account.",
    "Do not use this feature for money laundering or illegal purposes — your account may be permanently blocked.",
  ];

  const [userId, setUserId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [fee, setFee] = React.useState(0);
  const [receiveAmount, setReceiveAmount] = React.useState(0);
  const [amountError, setAmountError] = React.useState(false);
  const [amountErrorMessage, setAmountErrorMessage] = React.useState("");
  const [recipient, setRecipient] = useState<any>(null);
  const [recipientError, setRecipientError] = React.useState("");
  const [isVerify, setIsVerify] = useState(false);
  const [isDisable, setIsDisable] = useState(false);

  const [openDrawer, setOpenDrawer] = useState(false);

  const availableBalance = user?.m_balance;

  const [findUserByCustomerId, { data, isLoading, isError, error, isSuccess }] =
    useFindUserByCustomerIdMutation();

  const handleChangeUserId = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientError("");
    setUserId(e.target.value);
  };

  // handle change amount & check amount > user e_balance
  const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    setAmountError(false);
    setAmountErrorMessage("");

    const num = Number(value);

    if (num < 10) {
      setAmountError(true);
      setAmountErrorMessage("Minimum transfer amount is 10 USDT");
      return;
    }
    if (num <= 0) {
      setAmountError(true);
      setAmountErrorMessage("Amount must be greater than zero");
      return;
    }
    if (num > availableBalance) {
      setAmountError(true);
      setAmountErrorMessage("Amount exceeds your available balance");
      return;
    }

    if (num <= 0) {
      setAmountError(true);
      setAmountErrorMessage("Amount must be greater than zero");
      return;
    }
    if (num < 10) {
      setAmountError(true);
      setAmountErrorMessage("Minimum transfer amount is 10 USDT");
      return;
    }
    const calculatedFee = num * 0.03;
    setFee(calculatedFee);
    setReceiveAmount(num - calculatedFee);
  };

  // handle find user by customer id
  const handleFindUserByCustomerId = async () => {
    try {
      const res = await findUserByCustomerId(userId).unwrap();
      setRecipient(res?.user);
      setIsDisable(true);
      // check user id === recipient id
      if (res?.user?.customerId === user?.customerId) {
        setRecipientError("You cannot send to yourself");
        setRecipient(null);
        setIsDisable(false);
      }
    } catch (error) {
      console.log(error);
      setRecipientError((error as fetchBaseQueryError).data?.message);
    }
  };

  // send usdt
  const [
    send,
    {
      isLoading: s_isLoading,
      isError: s_isError,
      isSuccess: s_isSuccess,
      error: s_error,
    },
  ] = useSendMutation();

  // handle submit
  const handleSubmit = () => {
    const data = {
      recipient_id: recipient?.customer_id,
      amount: Number(amount),
      fee: fee,
      receive_amount: receiveAmount,
    };
    send(data);
  };

  // for send
  useEffect(() => {
    if (s_isError) {
      toast.error((s_error as fetchBaseQueryError).data.message);
    }
    if (s_isSuccess) {
      toast.success("Send successfully");
      setOpenDrawer(false);
      setUserId("");
      setAmount("");
      setFee(0);
      setReceiveAmount(0);
      setRecipient(null);
      setIsDisable(false);
      setIsVerify(false);
      router.push("/transactions");
    }
  }, [s_isError, s_error, s_isSuccess]);

  return (
    <div className="md:w-1/2 mx-auto  space-y-4">
      <Card className="bg-transparent">
        <div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-center text-blue-gray-300 ">
              Transfer USDT
            </h2>
          </div>
          <hr className="my-2 border border-blue-gray-800 " />
          <p className=" text-center text-xs font-semibold">User To User</p>
          <div className="my-4 space-y-3 text-sm">
            <div>
              <label
                htmlFor=""
                className="block mb-2 ml-1 text-sm font-medium text-blue-gray-300"
              >
                User ID
              </label>
              <input
                type="text"
                className="w-full px-2 py-2 border rounded-lg border-blue-gray-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600  text-sm placeholder:text-sm"
                placeholder="Enter User ID"
                value={userId}
                onChange={(e) => handleChangeUserId(e)}
                disabled={isDisable}
              />
              <small>
                {recipientError && (
                  <span className="text-xs text-red-500">{recipientError}</span>
                )}
              </small>
            </div>
            {/* Amount */}
            <div>
              <label
                htmlFor=""
                className="block mb-2 ml-1 text-sm font-medium text-blue-gray-300"
              >
                Transfer Amount
              </label>
              <input
                type="number"
                className="w-full px-2 py-2 border rounded-lg border-blue-gray-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600  text-sm placeholder:text-sm"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => handleChangeAmount(e)}
                disabled={isDisable}
              />
              {/* Show 5% fee */}
              <div className=" flex flex-col gap-1 mt-1 ml-1">
                <div className="flex justify-between">
                  <small className="text-xs text-green-500">
                    {fee > 0 ? (
                      <span>3% fee: {formatBalance(fee || 0)} USDT</span>
                    ) : (
                      <span>(3% fee will be charged.)</span>
                    )}
                  </small>
                  <small className="text-xs flex items-center gap-1 text-green-500">
                    <Image src={UsdtIcon} alt="usdt" width={12} height={12} />{" "}
                    <span>{formatBalance(availableBalance || 0)} USDT</span>
                  </small>
                </div>
                <small>
                  {amountError && (
                    <span className="text-xs text-red-500 font-bold">
                      {amountErrorMessage}
                    </span>
                  )}
                </small>
              </div>
            </div>

            {recipient && (
              <>
                <hr className="my-2 border border-blue-gray-800 " />
                <div className="px-4 ">
                  <div className="space-y-2 ">
                    <li className="flex items-center justify-between list-none ">
                      <span className="font-bold">Send Mod:</span>{" "}
                      <span>User Id</span>
                    </li>
                    <li className="flex items-center justify-between list-none ">
                      <span className="font-bold">To:</span>{" "}
                      <span className="flex flex-col">
                        {recipient?.customer_id}
                        <span className="text-xs text-blue-gray-500">
                          ({recipient?.name})
                        </span>
                      </span>
                    </li>

                    <li className="flex items-center justify-between list-none ">
                      <span className="font-bold">Total amount:</span>{" "}
                      <span>{amount} USDT</span>
                    </li>

                    <li className="flex items-center justify-between list-none ">
                      <span className="font-bold">Charge:</span>{" "}
                      <span>{formatBalance(fee || 0)} USDT</span>
                    </li>

                    <li className="flex items-center justify-between list-none ">
                      <span className="font-bold">Receive Amount:</span>{" "}
                      <span>{formatBalance(receiveAmount || 0)} USDT</span>
                    </li>

                    <li className="flex items-center justify-between list-none ">
                      <span className="font-bold">Send From:</span>{" "}
                      <span>Main Wallet ( USDT)</span>
                    </li>
                  </div>
                </div>
                <hr className="my-2 border border-blue-gray-800 " />
              </>
            )}

            <div>
              {recipient ? (
                <div>
                  {isVerify ? (
                    <button
                      onClick={handleSubmit}
                      className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={s_isLoading}
                    >
                      Proceed to Send
                    </button>
                  ) : (
                    <button
                      onClick={() => setOpenDrawer(true)}
                      className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-500"
                    >
                      Security Verify
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleFindUserByCustomerId}
                  className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    !userId ||
                    !amount ||
                    Number(amount) > user?.m_balance ||
                    isLoading ||
                    amountError
                  }
                >
                  Find Recipient
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>
      <RechargeInstructions
        data={transferData}
        title="Balance Transfer Instructions
"
      />
      {/* Modal */}
      <TransferDrawer
        open={openDrawer}
        setOpen={setOpenDrawer}
        handleConfirm={handleSubmit}
      />
    </div>
  );
};

export default TransferPage;
