# The terminal

## A command has grammar

A terminal command is a precise instruction. The first token usually names the program. Later tokens provide options and arguments. Spaces separate those pieces, capitalization matters, and the shell does not guess which file you intended.

## Program, option, argument

Read the command from left to right. Here, ls is the program, dash l h adds detail and readable sizes, and data slash is the target directory. Changing one token can change the operation, the output, or the file being acted on.

## Ask before you alter

Before running a command that creates or changes files, ask the shell where you are and what is present. P w d prints the working directory. L s dash l h lists its contents with useful details. Those two observations prevent many avoidable path errors.

## Read the error literally

Do not respond to an error by changing several things at once. Read the message, identify the failing token, and test one explanation. Confirm the program, the current directory, the target path, and the option. Small checks make the cause observable.

## Precision beats guessing

A shell command is structured language. Identify the program, options, and arguments; verify your location and target; and use the output to test your understanding. Precision is the habit that makes command-line work reproducible.
