"use client";

import { useState, useEffect } from "react";
import "./globals.css";
import supabase from "./api/supabaseClient";

export default function Home() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  //fetches lessons initially.
  useEffect(() => {
    async function fetchLessons() {
      const { data: lessons, error } = await supabase
        .from("lessons")
        .select(`*`);
      if (error) {
        setError(error);
      } else {
        setData(lessons);
      }
      setLoading(false);
    }

    fetchLessons();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        Sorry, something went wrong. Please refresh the page or try again later.
      </div>
    );
  }

  //filters the dataset into two categories: in progress and completed
  const filteredLessons = data.filter((lesson) => {
    if (filter === "all") return true;
    if (filter === "in progress") return lesson.status === "in progress";
    if (filter === "completed") return lesson.status === "completed";
    return true;
  });

  function cardRender(lesson) {
    console.log(lesson);
    //no need to break as returning
    switch (lesson.status) {
      case "completed":
        return (
          <div className="lesson-card completed" key={lesson.id}>
            <div>
              <h3 className="lesson-card-header">{lesson.title}</h3>
              <p>{lesson.description}</p>
            </div>
            <div>
              <p className="lesson-card-progress">Progress: Completed!</p>
              <div
                style={{ width: '100%' }}
                className="lesson-card-progress-bar"
              ></div>
            </div>
          </div>
        );
      //default is "in progress"
      default:
        return (
          <div className="lesson-card in-progress" key={lesson.id}>
            <div>
              <h3 className="lesson-card-header">{lesson.title}</h3>
              <p>{lesson.description}</p>
            </div>
            <div>
              <p className="lesson-card-progress">
                Progress: {lesson.progress}%
              </p>
              {/* Setting the width based on the progress */}
              <div
                style={{ width: `${lesson.progress}%` }}
                className="lesson-card-progress-bar"
              ></div>
            </div>
          </div>
        );
    }
  }
  return (
    <main>
      <section className="lesson-header">
        <h2>Your lessons</h2>

        <div className="lesson-controls">
          {/* built in html tag for dropdowns */}
          <label htmlFor="filter-select">Filter: </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-dropdown"
          >
            <option value="all">All</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </section>

      <section className="lesson-content">
        {filteredLessons.map((lesson) => cardRender(lesson))}
      </section>
    </main>
  );
}
