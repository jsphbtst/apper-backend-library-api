import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [authors, setAuthors] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async () => {
    try {
      await axios.post(
        "http://localhost:4000/sign-in",
        {
          email: "daryl@bakbakan.io",
          password: "password",
        },
        { withCredentials: true }
      );
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:4000/sign-out",
        {},
        { withCredentials: true }
      );
      setIsAuthenticated(false);
    } catch {}
  };

  useEffect(() => {
    const checkIfAuthenticated = async () => {
      try {
        await axios.get("http://localhost:4000/me", { withCredentials: true });
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkIfAuthenticated();
  }, []);

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:4000/authors", {
          method: "GET",
        });
        if (!response.ok) {
          setAuthors([]);
          return;
        }
        const responseJson = await response.json();
        setAuthors(responseJson.data);
      } catch {
        setAuthors([]);
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, []);

  if (isLoading) {
    return <h1>Loading content...</h1>;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section>
        {authors.map((author, idx) => {
          const { firstName, lastName, id } = author;
          const fullName = `${firstName} ${lastName}`;
          const key = `${id}-${firstName}-${lastName}__${idx}`;
          return (
            <div
              key={key}
              onClick={() => {
                router.push(`/authors/${id}`);
              }}
            >
              {fullName}
            </div>
          );
        })}
      </section>

      <section>
        {!isAuthenticated && <button onClick={login}>Log In</button>}
        {isAuthenticated && <button onClick={logout}>Log Out</button>}
      </section>
    </div>
  );
}