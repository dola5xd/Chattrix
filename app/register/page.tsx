"use client";
import { useForm } from "react-hook-form";
import { User, useUser } from "../context/UserContext";
import { account, registerUser } from "../_lib/appwrite";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AppwriteException } from "appwrite";

export type FormData = {
  Username: string;
  Email: string;
  password: string;
  rePassword: string;
};

function Page() {
  const { setLoggedInUser } = useUser();
  const navigate = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>();

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    const { Username, Email, password, rePassword } = data;
    if (password !== rePassword) {
      setErrorMessage("Passwords do not match!");
      setLoading(false);
      return;
    }
    try {
      await registerUser(Email, password, Username);
      const user = await account.get();
      setLoggedInUser(user as unknown as User);
      navigate.push("/");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await account.getSession("current");

        if (session) {
          const user = await account.get();

          setLoggedInUser(user as unknown as User);
          navigate.push("/");
        }
      } catch (error) {
        if (error instanceof AppwriteException && error.code === 401) {
          console.warn("No active session found. User is not logged in.");
          setLoggedInUser(null);
        } else {
          console.error("Error checking session:", error);
        }
      }
    };

    checkSession();
  }, [setLoggedInUser, navigate]);

  const password = watch("password");

  return (
    <main className="fixed flex flex-col items-center w-full h-full gap-10 py-20 bg-white">
      <h1 className="text-2xl">
        Welcome to
        <span className="px-1 py-2 ml-2 font-bold text-white rounded bg-Purple">
          Chattrix
        </span>
      </h1>
      <section className="flex flex-col w-full px-10 xl:w-1/2 gap-7">
        <h4 className="text-center text-gray-400 ">
          Register now and text with your friends!
        </h4>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 [&>div]:flex [&>div]:flex-col [&>div]:gap-2 px-10 [&>div>label]:text-gray-500 [&>div>input]:duration-500 [&>div>input]:px-2 [&>div>input]:py-2 [&>div>input]:bg-transparent [&>div>input]:rounded [&>div>input]:outline [&>div>input]:outline-2 [&>div>input]:outline-gray-500 focus:[&>div>input]:outline-Purple [&>div>input]:placeholder:text-sm [&>div>p]:text-red-600 [&>div>p]:text-sm"
        >
          <div>
            <label htmlFor="userName">Username:</label>
            <input
              type="text"
              id="userName"
              placeholder="Username"
              aria-invalid={errors.Username ? "true" : "false"}
              {...register("Username", { required: "Username is required" })}
            />
            {errors.Username && <p role="alert">{errors.Username.message}</p>}
          </div>
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
          <div>
            <label htmlFor="rePassword">Re-password:</label>
            <input
              type="password"
              id="rePassword"
              placeholder="Re-password"
              aria-invalid={errors.rePassword ? "true" : "false"}
              {...register("rePassword", {
                required: "Re-password is required",
                validate: (value) =>
                  value === password || "The passwords do not match",
              })}
            />
            {errors.rePassword && (
              <p role="alert">{errors.rePassword.message}</p>
            )}
          </div>
          <button
            type="submit"
            className={`${
              loading ? "bg-opacity-30" : ""
            } py-3 text-white rounded-md bg-Purple`}
          >
            {loading ? "Register..." : "Register!"}
          </button>
          <p className="text-center text-Purple">
            Already have account?{" "}
            <Link href={"/login"} className="underline">
              login now!
            </Link>
          </p>
          {errorMessage && (
            <p className="text-center text-red-600">
              {errorMessage}{" "}
              <Link href={"/login"} className="underline">
                Login
              </Link>
            </p>
          )}
        </form>
      </section>
    </main>
  );
}

export default Page;
