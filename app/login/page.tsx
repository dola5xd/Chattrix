"use client";
import { useForm } from "react-hook-form";
import { User, useUser } from "../context/UserContext";
import { account } from "../_lib/appwrite";
import { login } from "../_lib/apiCalls";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FormData } from "../register/page";

function Page() {
  const { setLoggedInUser, loggedInUser } = useUser();

  const navigate = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    const { Email, password } = data;

    try {
      await login(Email, password);
      const user = await account.get();
      setLoggedInUser(user as unknown as User);
      navigate.push("/"); // Redirect to home page after successful login
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message ===
          "Invalid credentials. Please check the email and password."
        )
          setErrorMessage(error.message);
      }
    } finally {
      setLoading(false);
    }
  });

  // Check if the user is already logged in and redirect them to the homepage
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await account.getSession("current");
        console.log("session: ", session);
        if (session) {
          setLoggedInUser(await account.get()); // Set the logged-in user context
          navigate.push("/"); // Redirect to the home page if logged in
        }
      } catch (error) {
        if (error instanceof Error) {
          if (
            !error.message.includes(
              "User (role: guests) missing scope (account)"
            )
          ) {
            setErrorMessage(error.message);
          }
        }
      }
    };
    checkSession();
  }, [setLoggedInUser, navigate]);

  useEffect(() => {
    if (loggedInUser) {
      navigate.push("/"); // Redirect to home page if logged in user is set
    }
  }, [loggedInUser, navigate]);

  return (
    <main className="fixed flex flex-col items-center w-full h-full gap-10 py-20 bg-white">
      <h1 className="text-2xl">
        Welcome to
        <span className="px-1 py-2 ml-2 font-bold text-white rounded bg-Purple">
          Chattrix
        </span>
      </h1>
      <section className="flex flex-col w-full xl:w-1/2 px-10 gap-7">
        <h4 className="text-center text-gray-400">
          Login now and text with your friends!
        </h4>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 [&>div]:flex [&>div]:flex-col [&>div]:gap-2 px-10 [&>div>label]:text-gray-500 [&>div>input]:duration-500 [&>div>input]:px-2 [&>div>input]:py-2 [&>div>input]:bg-transparent [&>div>input]:rounded [&>div>input]:outline [&>div>input]:outline-2 [&>div>input]:outline-gray-500 focus:[&>div>input]:outline-Purple [&>div>input]:placeholder:text-sm [&>div>p]:text-red-600 [&>div>p]:text-sm"
        >
          <div>
            <label htmlFor="Email">Email:</label>
            <input
              type="email"
              id="Email"
              placeholder="Email"
              {...register("Email", { required: "Email Address is required" })}
              aria-invalid={errors.Email ? "true" : "false"}
            />
            {errors.Email && <p role="alert">{errors.Email.message}</p>}
          </div>
          <div>
            <label htmlFor="Password">Password:</label>
            <input
              type="password"
              id="Password"
              placeholder="Password"
              aria-invalid={errors.password ? "true" : "false"}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters long",
                },
                maxLength: {
                  value: 265,
                  message: "Password must be less than 265 characters long",
                },
                validate: (value) =>
                  !["12345678", "password", "qwerty"].includes(value) ||
                  "Password should not be one of the commonly used passwords",
              })}
            />
            {errors.password && <p role="alert">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className={`${
              loading ? "bg-opacity-30" : ""
            } py-3 text-white rounded-md bg-Purple`}
          >
            {loading ? "Login..." : "Login!"}
          </button>
          <p className="text-center text-Purple">
            Not have account?{" "}
            <Link href={"/register"} className="underline">
              Register now!
            </Link>
          </p>
          {errorMessage && (
            <p className="text-sm text-center text-red-700">
              {errorMessage}
              {" or try "}
              <Link href={"/register"} className="underline">
                Register
              </Link>
            </p>
          )}
        </form>
      </section>
    </main>
  );
}

export default Page;
