# Getting started with Neurodesk

## Start in the right workspace

Neurodesk provides a consistent environment for neuroimaging software. Your access route may be Neurodesk Play, Neurodesk EDU, or an institutional deployment. The important first steps are to find persistent storage and open a terminal in which FSL is actually available.

## Launch FSL deliberately

The application workspace gives you access to packaged tools. Open the FSL tile or the approved FSL terminal rather than assuming the base shell contains every neuroimaging command. The exact arrangement can vary, so identify the tool by its name and purpose rather than by memorizing a screen position.

## Ask the shell what it knows

Run which fslinfo in the terminal. A returned path means the shell can locate the program. If the command returns nothing, stop there. You may be in a base terminal, or the FSL environment may not have loaded correctly.

## Temporary sessions can disappear

Browser workspaces can contain temporary files that disappear when the session ends. Before downloading data or starting an analysis, identify the persistent storage location provided by your environment. Save your data, scripts, logs, and notes there, then verify that the files remain after reopening the workspace.

## Access, storage, environment

Begin every Neurodesk session by confirming three things: the approved access route, the persistent storage location, and an FSL-enabled terminal. Those checks prevent lost files and confusing command-not-found errors later in the workflow.
