import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorSpottingBlock } from "./lesson/error-spotting-block";
import { LessonNotesDrawer } from "./lesson/lesson-notes-drawer";
import { DesignMatrixVisualizer } from "./tools/design-matrix-visualizer";
import { FSLCommandGenerator } from "./tools/fsl-command-generator";
import { WorkbenchPanel } from "./lesson/workbench-panel";
import { getAllNotes, getBookmarks, saveNote } from "@/lib/notes/store";
import { courses } from "@/lib/content/catalog";

const lesson = { lessonId: "probe", courseSlug: "course", lessonSlug: "lesson", lessonTitle: "Probe lesson", courseTitle: "Probe course" };
beforeEach(() => window.localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("review regression fixes", () => {
  it("selects a QC checkbox once through either the input or its label", () => {
    render(<ErrorSpottingBlock id="probe" title="QC" scenario="Inspect" summary="Summary" options={[{ id: "bad", description: "An error", isFlaw: true, explanation: "Fix it" }]} />);
    const checkbox = screen.getByRole("checkbox", { name: "An error" });
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(screen.getByRole("button", { name: "Submit Diagnosis" })).toBeEnabled();
    fireEvent.click(screen.getByText("An error"));
    expect(checkbox).not.toBeChecked();
  });
  it("defaults to correlation ratio and supplies segmentation, initialization, and schedule for BBR", () => {
    render(<FSLCommandGenerator />);
    fireEvent.click(screen.getByRole("button", { name: "flirt" }));
    expect(document.querySelector("code")!.textContent).toContain("-cost corratio");
    fireEvent.change(screen.getByRole("combobox", { name: "Cost Function" }), { target: { value: "bbr" } });
    fireEvent.change(screen.getByLabelText("White-matter segmentation (-wmseg)"), { target: { value: "my_wm.nii.gz" } });
    const command = document.querySelector("code")!.textContent!;
    expect(command).toContain("-dof 6 -cost bbr -wmseg my_wm.nii.gz");
    expect(command).toContain("-init example_func2highres_init.mat");
    expect(command).toContain('-schedule "$FSLDIR/etc/flirtsch/bbr.sch"');
  });
  it("uses lowercase -r for robust range and uppercase -R for absolute extrema", () => {
    render(<FSLCommandGenerator />);
    fireEvent.click(screen.getByRole("button", { name: "fslstats" }));
    const metric = screen.getByRole("combobox", { name: "Metric Flag" });
    fireEvent.change(metric, { target: { value: "-r" } });
    expect(document.querySelector("code")!.textContent).toMatch(/ -r$/);
    fireEvent.change(metric, { target: { value: "-R" } });
    expect(document.querySelector("code")!.textContent).toMatch(/ -R$/);
  });
  it("rejects contrasts when the shortened run contains no task events", () => {
    render(<DesignMatrixVisualizer />);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Total TR Volumes" }), { target: { value: "20" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Repetition Time (TR sec)" }), { target: { value: "0.5" } });
    expect(screen.getAllByText(/Not estimable from this design/)).toHaveLength(3);
    expect(screen.queryByText(/Estimable contrast for this simulated design/)).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("No signal in: Faces, Shapes");
  });
  it("clamps large acquisition inputs before allocating the matrix", () => {
    render(<DesignMatrixVisualizer />);
    const volumes = screen.getByRole("spinbutton", { name: "Total TR Volumes" });
    fireEvent.change(volumes, { target: { value: "1000000" } });
    expect(volumes).toHaveValue(300);
    expect(document.querySelectorAll("[title^='EV2 (Shapes)']")).toHaveLength(300);
    const tr = screen.getByRole("spinbutton", { name: "Repetition Time (TR sec)" });
    fireEvent.change(tr, { target: { value: "100" } });
    expect(tr).toHaveValue(5);
  });
  it("synchronizes both bookmark controls and notes drawers", () => {
    render(<><LessonNotesDrawer {...lesson} /><LessonNotesDrawer {...lesson} /></>);
    fireEvent.click(screen.getAllByRole("button", { name: "Bookmark" })[0]);
    expect(screen.getAllByRole("button", { name: "Bookmarked" })).toHaveLength(2);
    fireEvent.click(screen.getAllByRole("button", { name: "Bookmarked" })[1]);
    expect(getBookmarks()).toEqual([]);
    expect(screen.getAllByRole("button", { name: "Bookmark" })).toHaveLength(2);
    fireEvent.click(screen.getAllByRole("button", { name: "Notes" })[0]);
    fireEvent.change(screen.getByRole("textbox", { name: "New study note" }), { target: { value: "Shared note" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Note" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getAllByRole("button", { name: /Notes/ })[1]);
    expect(within(screen.getByRole("dialog")).getByText("Shared note")).toBeInTheDocument();
  });
  it("keeps the note draft and reports failure when storage is full, then retries successfully", () => {
    render(<LessonNotesDrawer {...lesson} />);
    fireEvent.click(screen.getByRole("button", { name: "Notes" }));
    const draft = screen.getByRole("textbox", { name: "New study note" });
    fireEvent.change(draft, { target: { value: "Important research note" } });
    const storage = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Full", "QuotaExceededError"); });
    fireEvent.click(screen.getByRole("button", { name: "Save Note" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Your draft has been kept");
    expect(draft).toHaveValue("Important research note");
    expect(getAllNotes()).toEqual([]);
    expect(() => saveNote({ ...lesson, content: "Another note" })).toThrow(/could not be saved/);
    storage.mockRestore();
    fireEvent.click(screen.getByRole("button", { name: "Save Note" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(draft).toHaveValue("");
    expect(getAllNotes()).toHaveLength(1);
  });
  it("does not claim unsupported commands ran successfully", () => {
    render(<WorkbenchPanel lesson={courses[0].modules[0].lessons[0]} />);
    const input = screen.getByRole("textbox", { name: "FSL practice command" });
    fireEvent.change(input, { target: { value: "not-a-command" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.queryByText(/Command executed successfully/)).not.toBeInTheDocument();
    expect(screen.getByText(/Unsupported command/)).toBeInTheDocument();
    expect(screen.getByText(/No files are processed/)).toBeInTheDocument();
  });
});
