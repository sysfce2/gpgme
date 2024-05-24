/*
    signarchivejob.cpp

    This file is part of qgpgme, the Qt API binding for gpgme
    Copyright (c) 2023 g10 Code GmbH
    Software engineering by Ingo Klöcker <dev@ingo-kloecker.de>

    QGpgME is free software; you can redistribute it and/or
    modify it under the terms of the GNU General Public License as
    published by the Free Software Foundation; either version 2 of the
    License, or (at your option) any later version.

    QGpgME is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
    General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA

    In addition, as a special exception, the copyright holders give
    permission to link the code of this program with any edition of
    the Qt library by Trolltech AS, Norway (or with modified versions
    of Qt that use the same license as Qt), and distribute linked
    combinations including the two.  You must obey the GNU General
    Public License in all respects for all of the code used other than
    Qt.  If you modify this file, you may extend this exception to
    your version of the file, but you are not obligated to do so.  If
    you do not wish to do so, delete this exception statement from
    your version.
*/

#ifdef HAVE_CONFIG_H
 #include "config.h"
#endif

#include "signarchivejob.h"
#include "signarchivejob_p.h"

#include <gpgme++/engineinfo.h>

using namespace QGpgME;

SignArchiveJob::SignArchiveJob(QObject *parent)
    : Job{parent}
{
}

SignArchiveJob::~SignArchiveJob() = default;

// static
bool SignArchiveJob::isSupported()
{
    static const auto gpgVersion = GpgME::engineInfo(GpgME::GpgEngine).engineVersion();
    return (gpgVersion >= "2.4.1") || (gpgVersion >= "2.2.42" && gpgVersion < "2.3.0");
}

void SignArchiveJob::setSigners(const std::vector<GpgME::Key> &signers)
{
    auto d = jobPrivate<SignArchiveJobPrivate>(this);
    d->m_signers = signers;
}

std::vector<GpgME::Key> SignArchiveJob::signers() const
{
    auto d = jobPrivate<SignArchiveJobPrivate>(this);
    return d->m_signers;
}

void SignArchiveJob::setInputPaths(const std::vector<QString> &paths)
{
    auto d = jobPrivate<SignArchiveJobPrivate>(this);
    d->m_inputPaths = paths;
}

std::vector<QString> SignArchiveJob::inputPaths() const
{
    auto d = jobPrivate<SignArchiveJobPrivate>(this);
    return d->m_inputPaths;
}

void SignArchiveJob::setOutputFile(const QString &path)
{
    auto d = jobPrivate<SignArchiveJobPrivate>(this);
    d->m_outputFilePath = path;
}

QString SignArchiveJob::outputFile() const
{
    auto d = jobPrivate<SignArchiveJobPrivate>(this);
    return d->m_outputFilePath;
}

void SignArchiveJob::setBaseDirectory(const QString &baseDirectory)
{
    auto d = jobPrivate<SignArchiveJobPrivate>(this);
    d->m_baseDirectory = baseDirectory;
}

QString SignArchiveJob::baseDirectory() const
{
    auto d = jobPrivate<SignArchiveJobPrivate>(this);
    return d->m_baseDirectory;
}

#include "signarchivejob.moc"
