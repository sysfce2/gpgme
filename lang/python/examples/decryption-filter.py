#!/usr/bin/env python3
#
# Copyright (C) 2016 g10 Code GmbH
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, see <http://www.gnu.org/licenses/>.

"""A decryption filter

This demonstrates decryption using pyme3 in three lines of code.  To
be used like this:

./decryption-filter.py <message.gpg >message.plain

"""

import sys
import pyme
pyme.Context().decrypt(sys.stdin, sink=sys.stdout)