"use client";

import { useState, useEffect } from "react";
import "./globals.css";
import supabase from "./api/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
export default function Home() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const router = useRouter();
  //fetches lessons initially.
  useEffect(() => {
    async function fetchLessons() {
      // Auth check
      // const {
      //   data: { session },
      // } = await supabase.auth.getSession();
      // if (!session) {
      //   router.replace("/login");
      //   return;
      // }
      // console.log(session);
      const { data: lessons, error } = await supabase
        .from("lessons")
        .select("*");

      if (error) {
        setError(error);
      } else {
        setData(lessons);
      }

      setLoading(false);
    }

    fetchLessons();
  }, [router]);

  if (loading) return <div>Loading...</div>;

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
                style={{ width: `100%` }}
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

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };
  const postExample = {
    author_avatar: "/coffee.png",
    author: "Job Tumibay",
    bio: "I'm a web developer focusing on creating fun stuff on the web. I like looking up at our night sky, and I'm always open for book recommendations.",
    date: Date.now(),
  };
  function ContentMeta({ post, bioEnabled = true }) {
    return (
      <div className="meta">
        <Image
          style={{ borderRadius: "50%" }}
          src={post.author_avatar}
          alt={post.author}
          width={40}
          height={40}
        />
        <div>
          <p>
            By {post.author} | {formatDate(post.date)}
          </p>
          {/* Could get too long */}
          {bioEnabled && <p className="meta--bio">{post.bio}</p>}
        </div>
      </div>
    );
  }

  function AboutCard({ post, variant }) {
    if (variant === "current") {
      return (
        <div className="about--content">
          <h2 className="about--name">{post.author}</h2>
          <Image
            style={{ borderRadius: "50%" }}
            className="about--image"
            src={post.author_avatar}
            alt={post.author}
            width={300}
            height={300}
          />
          <div className="about--bio">"{post.bio}"</div>
        </div>
      );
    }
    if (variant === "homepage") {
      const firstName = post.author.split(" ")[0];
      return (
        <div className="about--content__homepage">
          <Image
            style={{ borderRadius: "50%" }}
            className="about--image__homepage"
            src={post.author_avatar}
            alt={post.author}
            width={300}
            height={300}
          />
          <h2 className="about--name__homepage">{firstName}</h2>
          <p className="about--bio__homepage">{post.bio}</p>
        </div>
      );
    }

    return null;
  }

  return (
    <main>
      {/* <section className="lesson-header">
        <h2>Your lessons</h2>
        <button
          className="button"
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
        >
          Log out
        </button> */}
        {/* <a
          href="/api/linkedin/authorise"
          target="_blank"
          rel="noopener noreferrer"
          className="button"
        >
          Share on LinkedIn
        </a> */}
        {/* <div className="lesson-controls">
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
      </section> */}
      <div style={{ marginBottom: "40px" }}>
        <h2 className="header">Component on Blogs - Bio Enabled</h2>
        <ContentMeta post={postExample} />
      </div>
      <div style={{ marginBottom: "40px" }}>
        <h2 className="header">Component on Blogs - Bio Disabled</h2>
        <ContentMeta post={postExample} bioEnabled={false} />
      </div>
      <div style={{ marginBottom: "40px" }} className="content">
        <h2 className="header">Platform Content - Bio Enabled</h2>
        <ContentMeta post={postExample} />
      </div>

      <div style={{ marginBottom: "40px" }} className="content">
        <h2 className="header">Platform Content - Bio Disabled</h2>
        <ContentMeta post={postExample} bioEnabled={false} />
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ textAlign: "center" }} className="header">
          About Teams - Variant
        </h2>
        <div className="about">
          <AboutCard post={postExample} variant="current"></AboutCard>
          <AboutCard post={postExample} variant="homepage"></AboutCard>
        </div>
      </div>

      {/* <section className="lesson-content">
        {filteredLessons.map((lesson) => cardRender(lesson))}
      </section> */}
    </main>
  );
}
