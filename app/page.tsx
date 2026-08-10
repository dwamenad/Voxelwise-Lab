import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Eye, MonitorPlay, Play, Repeat2 } from "lucide-react";
import { CourseCard } from "@/components/course/course-card";
import { courses } from "@/lib/content/catalog";

export default function Home() {
  return (
    <main>
      <section className="home-hero">
        <div className="home-hero__image" aria-hidden="true">
          <Image src="/curriculum/fsleyes-timeseries.png" alt="" fill priority sizes="(max-width: 900px) 100vw, 58vw" />
          <div className="home-hero__scanline" />
        </div>
        <div className="home-hero__content">
          <div className="hero-kicker"><span>Graduate fMRI methods</span><span>Independent study</span></div>
          <h1>Learn FSL by actually doing fMRI analysis.</h1>
          <p>Step-by-step courses that explain the concepts, demonstrate real analyses in Neurodesk, and help you reproduce each workflow yourself.</p>
          <div className="hero-actions"><Link className="button button--acid" href="/courses">Browse courses <ArrowRight size={18} /></Link><a className="button button--ghost-light" href="#how-it-works"><Play size={17} />How it works</a></div>
        </div>
        <div className="home-hero__caption"><span>01</span><p>Real FSLEyes workspace from the adapted TUBRIC curriculum.</p></div>
      </section>

      <section className="learning-method section-pad" id="how-it-works">
        <div className="section-heading"><span className="eyebrow">The learning loop</span><h2>Understand it. See it. Do it.</h2><p>Keep Neurodesk open beside each lesson and make the analysis decisions yourself.</p></div>
        <ol className="method-steps">
          {[
            ["01", "Learn the concept", "Build the scientific mental model before opening a tool."],
            ["02", "Watch the analysis", "See each decision made in a real FSL and Neurodesk workflow."],
            ["03", "Reproduce it", "Pause, switch windows, and perform the same step on the exercise data."],
            ["04", "Compare your output", "Use expected results and QC prompts to explain discrepancies."],
            ["05", "Continue", "Mark completion only after you have carried out the practical work."],
          ].map(([number, title, body]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}
        </ol>
      </section>

      <section className="featured-courses section-pad">
        <div className="section-heading section-heading--row"><div><span className="eyebrow">Start here</span><h2>Courses built around real analysis decisions.</h2></div><Link className="text-link" href="/courses">View all six courses <ArrowRight size={16} /></Link></div>
        <div className="course-list">{courses.filter((course) => course.status === "available").map((course) => <CourseCard course={course} featured key={course.id} />)}</div>
      </section>

      <section className="neurodesk-section">
        <div className="neurodesk-section__visual"><Image src="/curriculum/neurodesk-launch.png" alt="Neurodesk launcher interface" fill sizes="(max-width: 900px) 100vw, 48vw" /></div>
        <div className="neurodesk-section__copy"><span className="eyebrow">A lab you can open anywhere</span><h2>Use your cluster—or bring the lab with you.</h2><p>If FSL is not installed locally, follow the practical work through Neurodesk Play or Neurodesk EDU. The courses teach the same terminal and interface workflow used in institutional environments.</p><ul><li><MonitorPlay /><span><strong>Browser access</strong>Use FSL without a complex local installation.</span></li><li><Repeat2 /><span><strong>Reproducible environment</strong>Work from a consistent, versioned tool setup.</span></li><li><Eye /><span><strong>Side-by-side QC</strong>Keep the lesson and analysis visible together.</span></li></ul><Link className="button button--dark" href="/courses/fsl-neuroimaging-foundations/lessons/getting-started-with-neurodesk">Set up Neurodesk <ArrowRight size={17} /></Link></div>
      </section>

      <section className="topics-section section-pad">
        <div className="section-heading"><span className="eyebrow">Curriculum</span><h2>From the first voxel to a group model.</h2></div>
        <div className="topic-index">{["FSL & FSLEyes", "Preprocessing", "Task-based fMRI", "The general linear model", "Contrasts", "Higher-level analysis", "ROI analysis", "PPI & ICA", "Linux & reproducibility"].map((topic, index) => <div key={topic}><span>{String(index + 1).padStart(2, "0")}</span><p>{topic}</p><Check size={17} /></div>)}</div>
      </section>

      <section className="final-cta"><span className="eyebrow">Open the next window</span><h2>Learn the method by running it.</h2><p>Start with the foundations, then build your first FEAT model.</p><Link href="/courses" className="button button--acid">Browse courses <ArrowRight size={18} /></Link></section>
    </main>
  );
}
