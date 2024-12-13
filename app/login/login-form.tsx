"use client";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import Form from "next/form";
import loginAction from "./loginAction";

import { useActionState } from "react";
import { useEffect, useState } from "react";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (state?.success !== undefined) {
      setShowMessage(true);

      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 3000); // 3 segundos

      return () => clearTimeout(timer); // Limpeza do temporizador ao desmontar
    }
  }, [state]);

  return (
    <>
      {showMessage && state?.success === false && (
        <div
          className="text-xs mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Erro!</strong>
          <span className="block mt-1">{state?.message}</span>
        </div>
      )}
      {showMessage && state?.success === true && (
        <div
          className="text-xs mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Sucesso!</strong>
          <span className="block mt-1">{state?.message}</span>
        </div>
      )}
      <Form action={formAction}>
        <div>
          <Label>Email</Label>
          <Input type="email" name="email" placeholder="eu@exemplo.com" />
        </div>
        <div>
          <Label>Senha</Label>
          <Input type="password" name="password" placeholder="********" />
        </div>
        <div>
          <Button className="w-full mt-6" type="submit">
            Login
          </Button>
        </div>
      </Form>
    </>
  );
}
