"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import PulseLoader from "react-spinners/PulseLoader";

import { useCheckOldPinMutation } from "@/redux/features/auth/authApi";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface SymbolDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  handleConfirm: () => void;
}

export function TransferDrawer({
  open,
  setOpen,
  handleConfirm,
}: SymbolDrawerProps) {
  const [oldPin, setOldPin] = useState("");
  const [oldPinError, setOldPinError] = useState(false);
  const [oldPinErrorText, setOldPinErrorText] = useState("");
  const [isOldPinChecked, setIsOldPinChecked] = useState(false);

  const [
    checkOldPin,
    {
      isLoading: isCheckingPin,
      isSuccess: isSuccessOldPin,
      isError: isErrorOldPin,
      error: errorOldPin,
    },
  ] = useCheckOldPinMutation();

  // handle old pin change
  const handleOldPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Only allow digits and max 6 characters
    if (/^\d{0,6}$/.test(value)) {
      setOldPin(value);

      if (value.length < 6) {
        setOldPinError(true);
        setOldPinErrorText("PIN must be exactly 6 digits");
      } else {
        setOldPinError(false);
        setOldPinErrorText("");
      }
    }
  };

  // ✅ Blur Handler
  const handleOldPinBlur = () => {
    if (oldPin.length !== 6) {
      setOldPinError(true);
      setOldPinErrorText("PIN must be exactly 6 digits");
    } else {
      setOldPinError(false);
      setOldPinErrorText("");
      handleOldPinCheck(); // check from server
    }
  };

  //handle old pin check
  const handleOldPinCheck = () => {
    const data = {
      oldPassCode: oldPin,
    };
    checkOldPin(data);
  };

  // useEffect to handle success and error
  useEffect(() => {
    if (isSuccessOldPin) {
      setIsOldPinChecked(true);
      setOldPinError(false);
      setOldPinErrorText("");
    }

    if (isErrorOldPin) {
      setIsOldPinChecked(false);
      setOldPinError(true);
      setOldPinErrorText("Pin is incorrect!");
    }
  }, [isSuccessOldPin, isErrorOldPin, errorOldPin]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="max-h-[85vh] rounded-t-3xl px-2 pb-4 bg-gray-900">
        <div className="mx-auto w-full px-4 py-2">
          <DrawerHeader>
            <DrawerTitle className="text-sm text-gray-100 text-center">
              Security Verify
            </DrawerTitle>
          </DrawerHeader>
        </div>
        <div className="grid items-start gap-4  ">
          <div className="grid gap-2">
            <Label
              htmlFor="email"
              className={`${
                oldPinError ? "text-red-500" : "text-gray-100"
              } ml-1`}
            >
              Enter Your Pin
            </Label>
            <Input
              type="tex"
              id="email"
              placeholder="e.g. 123456"
              onChange={handleOldPinChange}
              onBlur={handleOldPinBlur}
              className={`${
                oldPinError
                  ? "border-red-500 text-red-500"
                  : "border-gray-300 text-gray-100"
              }`}
            />
            {oldPinError && (
              <span className="text-xs text-red-500 font-bold ml-1 mt-1">
                {oldPinErrorText}
              </span>
            )}
          </div>

          <Button
            className="bg-htx-blue"
            disabled={!isOldPinChecked || isCheckingPin}
            onClick={handleConfirm}
          >
            {isCheckingPin ? (
              <PulseLoader color="white" size={8} className="mx-auto" />
            ) : (
              "Confirm "
            )}
          </Button>
        </div>
        <DrawerFooter className="px-0 py-2">
          <DrawerClose asChild>
            <Button variant="outline" className="bg-orange-500 text-white">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
