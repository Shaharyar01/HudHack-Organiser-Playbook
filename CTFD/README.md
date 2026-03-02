# 🚩 Capture The Flag (CTF) Setup

For HudHack 2026, we ran a Capture The Flag (CTF) competition alongside the main hackathon. 

The CTFs were a lot more popular than we thought, and two teams actually completed every single challenge on the board. For next year, make sure to prepare more challenges and include significantly harder ones so people don't run out of things to do.

## The 2026 Archive
I have included our official CTFd export file (`.zip`) in this folder. 

Instead of starting from scratch, you can spin up a local instance of CTFd, go to **Admin Panel > Config > Backup > Import**, and upload this file. It will load all of our 2026 challenges, descriptions, hints, and point values so you can get ideas for next year.

## What is CTFd and why use it?
[CTFd](https://ctfd.io/) is an open-source platform used for hosting CTFs. We chose it because it automatically handles user registration, team creation, and the live leaderboard.

*Note: The CTFd admin dashboard looks really daunting at the start, but it gets much easier to use once you actually set up your first few challenges.*

## Challenge Setup Guide
When designing the board for next year, make sure to follow these steps:

* **Use "Dynamic" Scoring:** Always select Dynamic scoring instead of Standard. This means the first team to solve a challenge gets the most points, and the point value drops for anyone who solves it after them. This is the best way to prevent a draw at the top of the leaderboard.
* **Make a Tutorial Category:** Make the first few CTFs a basic tutorial so people get an idea of what CTFs are. Use these to show them exactly what the flag format looks like (e.g., `flag{your_text_here}`).
* **Hints:** It is important to have hints for beginners, but make sure you set them to cost points to unlock.
* **Categories:** Aim to create CTFs within different categories so there is a good variety. We used OSINT, Web Exploitation, Cryptography, Reverse Engineering, Forensics, and Misc.

## Hosting & Containers
For basic challenges (like OSINT, Crypto, or Forensics), you just need to upload a file or write a description directly in CTFd. 

For more advanced challenges (like Web Exploitation), participants will need a live target to hack into.
* You need to set up Docker containers for these.
* **Never** host a vulnerable web challenge on the same server that is running your CTFd instance. 
* Host these containers on an isolated server (like DigitalOcean or AWS) and just provide the IP address and Port in the CTFd challenge description so people can connect to it.
