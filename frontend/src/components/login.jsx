/* eslint-disable no-unused-vars */
/* eslint-disable no-constant-condition */
import React, { useEffect, useState } from "react";
import useFetch from "@/hooks/useFetch.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BeatLoader } from "react-spinners";
import Error from "@/components/error";
import { login } from "@/api/apiAuth";
import * as Yup from "yup";

const Login = () => {
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const onHandleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevstate) => ({
      ...prevstate,
      [name]: value,
    }));
  };

  const { data, loading, error, fn: loginFn } = useFetch(login, formData);

  useEffect(() => {
    console.log(data);
    // if(error === null && data){

    // }
  }, [data, error]);

  const handleLogin = async () => {
    setErrors([]);
    try {
      const schema = Yup.object().shape({
        email: Yup.string()
          .email("Invalid email")
          .required("Email is required"),
        password: Yup.string()
          .min(6, "Password must atleast be 6 characters")
          .required("password is required"),
      });
      await schema.validate(formData, { abortEarly: false });
      await loginFn();
    } catch (e) {
      const newErrors = {};
      e?.inner?.forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          {error && <Error message={error.message} />}
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Input
              name="email"
              type="email"
              placeholder="Enter email"
              onChange={onHandleInputChange}
            />
            {errors.email && <Error message={errors.email} />}
          </div>
          <div className="space-y-1">
            <Input
              name="password"
              type="password"
              placeholder="Enter password"
              onChange={onHandleInputChange}
            />
            {errors.password && <Error message={errors.password} />}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin}>
            {false ? <BeatLoader size={10} /> : "Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
