---
title: 使用zsh替换bash
date: '2016-07-22'
description: >-
  yum install zsh Changing your default shell After installing one the above
  shells, you can execute that shell inside of your current shell, by just
  running its
category: linux
tags: []
draft: false
source: evernote-local-db
lang: zh
---
yum install zsh

Changing your default shell

After installing one the above shells, you can execute that shell inside of your current shell, by just running its executable. If you want to be served that shell when you login however, you will need to change your default shell.

To list all installed shells, run:

$ chsh -l

And to set one as default for your user do:

$ chsh -s _full-path-to-shell_

where _full-path-to-shell_ is the full path as given by chsh -l.

If you now log out and log in again, you will be greeted by the other shell.
