# The terminal

## The terminal

The terminal. Read a shell prompt and understand commands, options, and arguments. The goal is clear: Identify a command and its arguments.

## Commands are precise instructions

Commands are precise instructions. A shell command usually begins with a program name, followed by options and arguments. Spaces separate tokens; capitalization matters; the shell does not guess which file you intended. In ls -lh data, ls is the command, -lh changes the display, and data is the target directory. Reading commands this way makes unfamiliar examples easier to adapt.

## Try this in Neurodesk

Now connect the idea to an observable check. First, open a base terminal. Next, run the command below. Then, use man ls or ls --help and find the meaning of -h. The command shown on screen is an example. Adapt its path to your own working directory and verify the target before running it.

## What would make this interpretation trustworthy?

Quality control comes before interpretation. The exact listing differs. -l adds details and -h makes sizes human-readable. A useful self-check is this: What role does data play in ls -lh data? It is the argument—the directory that ls should list.

## Carry the reasoning into the next step

To recap: First, commands, options, and arguments are separate tokens. Next, paths and capitalization must be exact. Before continuing, make sure you can explain this objective: Identify a command and its arguments.

---

Source: tubric/2026s-fmri-class, Lab-0_Glossary.md, Command + arguments + options; MIT License.
