import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const SpecificAuthor = () => {
  const router = useRouter();
  const authorId = router.query.authorId;

  const [isLoading, setIsLoading] = useState(true);
  const [author, setAuthor] = useState({});

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      if (!authorId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:4000/authors/${authorId}`,
          {
            withCredentials: true,
          }
        );
        setAuthor(response.data.data);
      } catch {
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, [authorId, router]);

  if (isLoading) {
    return <h1>Loading author...</h1>;
  }

  return (
    <div>
      <div>{author.firstName}</div>
      <div>{author.lastName}</div>
    </div>
  );
};

export default SpecificAuthor;
