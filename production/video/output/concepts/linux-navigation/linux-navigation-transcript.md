# Linux navigation

## Linux navigation

Linux navigation. Use pwd, ls, and cd to move through a project without losing track of your location. The goal is clear: Report the current working directory.

## Your working directory is context

Your working directory is context. Relative paths are interpreted from the current working directory. Absolute paths begin at the filesystem root /. Many “missing file” errors are really context errors: the file exists, but not where the current command is looking. Use pwd before any command that writes output. Use ls to verify the next directory name before cd. The shortcuts dot and dot dot mean the current and parent directories, while tilde means your home directory.

## Try this in Neurodesk

Now connect the idea to an observable check. First, print your current location. Next, create a course practice directory. Then, enter it and create data and output subfolders. After that, return to the parent directory using dot dot. The command shown on screen is an example. Adapt its path to your own working directory and verify the target before running it.

## What would make this interpretation trustworthy?

Cannot find a file? Stop and verify context instead of repeatedly changing the command. Print the directory, list its contents, then search narrowly. A useful self-check is this: When is data/sub-001 a valid path? When a data directory exists inside the current working directory; otherwise use the correct relative or absolute path.

## Carry the reasoning into the next step

To recap: First, use pwd then ls then cd as a deliberate loop. Next, create output directories before analysis. Then, most path errors are diagnosable with small checks. Before continuing, make sure you can explain this objective: Report the current working directory.

---

Source: tubric/2026s-fmri-class, Lab-0_GeneralTroubleshootingGuide.md, Linux navigation basics; MIT License.
