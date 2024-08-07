/* setownertrust.c - Set ownertrust helpers.
 * Copyright (C) 2024 g10 Code GmbH
 *
 * This file is part of GPGME.
 *
 * GPGME is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * GPGME is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this program; if not, see <https://gnu.org/licenses/>.
 * SPDX-License-Identifier: LGPL-2.1-or-later
 */

#if HAVE_CONFIG_H
#include <config.h>
#endif
#include <stdlib.h>

#include "gpgme.h"
#include "debug.h"
#include "context.h"
#include "ops.h"


typedef struct
{
  /* The error code from a FAILURE status line or 0.  */
  gpg_error_t failure_code;

  /* The error code from an ERROR status line or 0.  */
  gpg_error_t error_code;

} *op_data_t;


/* Parse an error status line.  Return the error location and the
   error code.  The function may modify ARGS. */
static char *
parse_error (char *args, gpg_error_t *r_err)
{
  char *where = strchr (args, ' ');
  char *which;

  if (where)
    {
      *where = '\0';
      which = where + 1;

      where = strchr (which, ' ');
      if (where)
	*where = '\0';

      where = args;
    }
  else
    {
      *r_err = trace_gpg_error (GPG_ERR_INV_ENGINE);
      return NULL;
    }

  *r_err = atoi (which);

  return where;
}


static gpgme_error_t
setownertrust_status_handler (void *priv, gpgme_status_code_t code, char *args)
{
  gpgme_ctx_t ctx = (gpgme_ctx_t) priv;
  gpgme_error_t err;
  void *hook;
  op_data_t opd;
  char *loc;

  err = _gpgme_op_data_lookup (ctx, OPDATA_SETOWNERTRUST, &hook, -1, NULL);
  opd = hook;
  if (err)
    return err;

  switch (code)
    {
    case GPGME_STATUS_ERROR:
      loc = parse_error (args, &err);
      if (!loc)
        return err;
      if (!opd->error_code)
        opd->error_code = err;
      break;

    case GPGME_STATUS_FAILURE:
      if (!opd->failure_code
          || gpg_err_code (opd->failure_code) == GPG_ERR_GENERAL)
        opd->failure_code = _gpgme_parse_failure (args);
      break;

    case GPGME_STATUS_EOF:
      if (opd->error_code)
        err = opd->error_code;
      else if (opd->failure_code)
        err = opd->failure_code;
      break;

    default:
      break;
    }

  return err;
}


/* Set the ownertrust of a key or enable/disable a key.  See
   --quick-set-ownertrust in the gnupg documentation. */
static gpg_error_t
setownertrust (gpgme_ctx_t ctx, int synchronous,
               gpgme_key_t key,
               const char *value)
{
  gpgme_error_t err;
  void *hook;
  op_data_t opd;

  TRACE_BEG  (DEBUG_CTX, "gpgme_op_setownertrust", ctx,
              "%d key=%p value: %s",
              synchronous, key, value);

  if (!ctx)
    return TRACE_ERR (gpg_error (GPG_ERR_INV_VALUE));

  if (ctx->protocol != GPGME_PROTOCOL_OPENPGP)
    return TRACE_ERR (gpgme_error (GPG_ERR_UNSUPPORTED_PROTOCOL));

  if (!key)
    return TRACE_ERR (gpg_error (GPG_ERR_INV_VALUE));

  err = _gpgme_op_reset (ctx, synchronous);
  if (err)
    return err;

  err = _gpgme_op_data_lookup (ctx, OPDATA_SETOWNERTRUST, &hook, sizeof (*opd),
                               NULL);
  opd = hook;
  if (err)
    return err;

  _gpgme_engine_set_status_handler (ctx->engine, setownertrust_status_handler,
                                    ctx);

  err = _gpgme_engine_op_setownertrust (ctx->engine, key, value);

  if (synchronous && !err)
    err = _gpgme_wait_one (ctx);
  return TRACE_ERR (err);
}


/* See setownertrust. */
gpgme_error_t
gpgme_op_setownertrust_start (gpgme_ctx_t ctx,
                              gpgme_key_t key,
                              const char *value)
{
  return setownertrust (ctx, 0, key, value);
}


/* See setownertrust.  This is the synchronous variant.  */
gpgme_error_t
gpgme_op_setownertrust (gpgme_ctx_t ctx,
                        gpgme_key_t key,
                        const char *value)
{
  return setownertrust (ctx, 1, key, value);
}
