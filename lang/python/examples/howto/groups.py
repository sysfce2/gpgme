# -*- coding: utf-8 -*-

from __future__ import absolute_import, division, unicode_literals

# Copyright (C) 2018 Ben McGinnes <ben@gnupg.org>
#
# This program is free software; you can redistribute it and/or modify it under
# the terms of the GNU General Public License as published by the Free Software
# Foundation; either version 2 of the License, or (at your option) any later
# version.
#
# This program is free software; you can redistribute it and/or modify it under
# the terms of the GNU Lesser General Public License as published by the Free
# Software Foundation; either version 2.1 of the License, or (at your option)
# any later version.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE.  See the GNU General Public License and the GNU
# Lesser General Public Licensefor more details.
#
# You should have received a copy of the GNU General Public License and the GNU
# Lesser General Public along with this program; if not, see
# <http://www.gnu.org/licenses/>.

import subprocess

lines = subprocess.getoutput("gpgconf --list-options gpg").splitlines()

for i in range(len(lines)):
    if lines[i].startswith("group") is True:
        line = lines[i]
    else:
        pass

groups = line.split(":")[-1].replace('"', '').split(',')

group_lines = groups
for i in range(len(group_lines)):
    group_lines[i] = group_lines[i].split("=")

group_lists = group_lines
for i in range(len(group_lists)):
    group_lists[i][1] = group_lists[i][1].split()