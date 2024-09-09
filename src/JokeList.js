import {React, useState, useEffect, useCallback} from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

/** List of jokes. */

const JokeList = ({numJokesToGet = 5}) => {
  const [jokes, setJokes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getJokes = useCallback(async () => {
    try {
      console.log('Getting jokes...');
      // load jokes one at a time, adding not-yet-seen jokes
      let jokes = [];
      let seenJokes = new Set();

      while (jokes.length < numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" }
        });
        let { ...joke } = res.data;

        if (!seenJokes.has(joke.id)) {
          seenJokes.add(joke.id);
          jokes.push({ ...joke, votes: 0 });
        } else {
          console.log("duplicate found!");
        }
      }

      setJokes(jokes);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
    }
  }, [numJokesToGet]);

  useEffect(() => {
    getJokes();
  }, [getJokes]);

  const generateNewJokes = () => {
    setIsLoading(true);
    getJokes();
  }

  const vote = (id, delta) => {
    setJokes(jokes.map(j => {
      if (j.id === id) {
        return { ...j, votes: j.votes + delta };
      }
      return j;
    }));
  }

  const sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);

  return (
    <>
      {isLoading ? (
        <div className="loading">
          <i className="fas fa-4x fa-spinner fa-spin" />
        </div>
      ) : (
        <div className="JokeList">
          <button className="JokeList-getmore" onClick={generateNewJokes}>
            Get New Jokes
          </button>

          {sortedJokes.map(j => (
            <Joke
              key={j.id}
              id={j.id}
              text={j.joke}
              votes={j.votes}
              vote={vote}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default JokeList;
