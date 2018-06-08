/* gpgme.js - Javascript integration for gpgme
 * Copyright (C) 2018 Bundesamt für Sicherheit in der Informationstechnik
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
 * License along with this program; if not, see <http://www.gnu.org/licenses/>.
 * SPDX-License-Identifier: LGPL-2.1+
 *
 * Author(s):
 *     Maximilian Krambach <mkrambach@intevation.de>
 */

const inputvalues = {// eslint-disable-line no-unused-vars
    encrypt: {
        good:{
            data : 'Hello World.',
            // Fingerprint of a key that has been imported to gnupg
            // (i.e. see testkey.pub; testkey.sec)
            fingerprint : 'D41735B91236FDB882048C5A2301635EEFF0CB05',
            data_nonascii: '¡Äußerste µ€ før ñoquis@hóme! Добрый день',

            // used for checking encoding consistency in > 2MB messages.
            data_nonascii_32: [
                'K€K€K€K€K€K€K€K€K€K€K€K€K€K€K€K€',
                'µ€µ€µ€µ€µ€µ€µ€µ€µ€µ€µ€µ€µ€µ€µ€µ€',
                '€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€',
                '²³²³²³²³²³²³²³²³²³²³²³²³²³²³²³²³',
                'µ€µ€µ€µ€µ€µ€µ€µ€µ€µ€µ€A€µ€µ€µ€µ€',
                'µ€µ€µ€µ€µ€µ€µ€µ€µ€µ€µ€µAµ€µ€µ€µ€',
                'üüüüüüüüüüüüüüüüüüüüüüüüüüüüüüüü',
                'µAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA€',
                'µAAAAµAAAAAAAAAAAAAAAAAAAAAAAAA€',
                'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAµ€',
                'µAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA°',
                '€AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA€',
                'µ||||||||||||||||||||||||||||||€',
                'æſæſ³¼„¬“³³¬“¬½”æſæſ³¼„¬“³³¬“¬½”'
            ]
        },
        bad: {
            // valid Hex value, but not usable (not imported to gnupg, or
            // bogus fingerprint)
            fingerprint: 'CDC3A2B2860625CCBFC5AAAAAC6D1B604967FC4A'
        }
    },
    init: {
        // some parameters
        invalid_startups: [
            {all_passwords: true},
            'openpgpmode',
            {api_style:'frankenstein'}
        ]
    }
};

// (Pseudo-)Random String covering all of utf8.
function bigString(length){// eslint-disable-line no-unused-vars
    let arr = [];
    for (let i= 0; i < length; i++){
        arr.push(String.fromCharCode(
            Math.floor(Math.random() * 10174) + 1)
        );
    }
    return arr.join('');
}

function fixedLengthString(megabytes){// eslint-disable-line no-unused-vars
    let maxlength = 1024 * 1024 * megabytes / 2;
    let uint = new Uint8Array(maxlength);
    for (let i = 0; i < maxlength; i++){
        uint[i] = Math.floor(Math.random()* 256);
    }
    let td = new TextDecoder('ascii');
    let result = td.decode(uint);
    return result;
}

// (Pseudo-)Random Uint8Array, given size in Megabytes
function bigUint8(megabytes){// eslint-disable-line no-unused-vars
    let maxlength = 1024 * 1024 * megabytes;
    let uint = new Uint8Array(maxlength);
    for (let i= 0; i < maxlength; i++){
        uint[i] = Math.random() * Math.floor(256);
    }
    return uint;
}

// (Pseudo-)Random string with very limited charset
// (ascii only, no control chars)
function bigBoringString(megabytes){// eslint-disable-line no-unused-vars
    let maxlength = 1024 * 1024 * megabytes;
    let string = [];
    let chars =
        ' 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i= 0; i < maxlength; i++){
        string.push(chars[Math.floor(Math.random() * chars.length)]);
    }
    return string.join('');
}

// Some String with simple chars, with different characteristics, but still
// expected to occur in an averag message
// eslint-disable-next-line no-unused-vars
function slightlyLessBoringString(megabytes, set){
    let maxlength = 1024 * 1024 * megabytes;
    let string = [];
    let chars = '';
    if (set ===1 ) {
        chars = '\n"\r \'';
    } else if (set === 2 ) {
        chars = '()=?`#+-{}[]';
    } else if (set === 3){
        chars = '^°/';
    } else if (set ===4) {
        chars = 'äüßµüþÖ~ɁÑ||@';
    } else {
        chars = '*<>\n"\r§$%&/()=?`#+-{}[] \'';
    }
    for (let i= 0; i < maxlength; i++){
        string.push(chars[Math.floor(Math.random() * chars.length)]);
    }
    return string.join('');
}

// Data encrypted with testKey
const encryptedData =// eslint-disable-line no-unused-vars
    '-----BEGIN PGP MESSAGE-----\n' +
    '\n' +
    'hQEMA6B8jfIUScGEAQgAlANd3uyhmhYLzVcfz4LEqA8tgUC3n719YH0iuKEzG/dv\n' +
    'B8fsIK2HoeQh2T3/Cc2LBMjgn4K33ksG3k2MqrbIvxWGUQlOAuggc259hquWtX9B\n' +
    'EcEoOAeh5DuZT/b8CM5seJKNEpPzNxbEDiGikp9DV9gfIQTTUnrDjAu5YtgCN9vA\n' +
    '3PJxihioH8ODoQw2jlYSkqgXpBVP2Fbx7qgTuxGNu5w36E0/P93//4hDXcKou7ez\n' +
    'o0+NEGSkbaY+OPk1k7k9n+vBSC3F440dxsTNs5WmRvx9XZEotJkUBweE+8XaoLCn\n' +
    '3RrtyD/lj63qi3dbyI5XFLuPU1baFskJ4UAmI4wNhdJ+ASailpnFBnNgiFBh3ZfB\n' +
    'G5Rmd3ocSL7l6lq1bVK9advXb7vcne502W1ldAfHgTdQgc2CueIDFUYAaXP2OvhP\n' +
    'isGL7jOlDCBKwep67ted0cTRPLWkk3NSuLIlvD5xs6L4z3rPu92gXYgbZoMMdP0N\n' +
    'kSAQYOHplfA7YJWkrlRm\n' +
    '=zap6\n' +
    '-----END PGP MESSAGE-----\n';

const ImportablePublicKey = {// eslint-disable-line no-unused-vars
    fingerprint: '78034948BA7F5D0E9BDB67E4F63790C11E60278A',
    key:'-----BEGIN PGP PUBLIC KEY BLOCK-----\n' +
    '\n' +
    'mQENBFsPvK0BCACaIgoIN+3g05mrTITULK/YDTrfg4W7RdzIZBxch5CM0zdu/dby\n' +
    'esFwaJbVQIqu54CRz5xKAiWmRrQCaRvhvjY0na5r5UUIpbeQiOVrl65JtNbRmlik\n' +
    'd9Prn1kZDUOZiCPIKn+/M2ecJ92YedM7I4/BbpiaFB11cVrPFg4thepn0LB3+Whp\n' +
    '9HDm4orH9rjy6IUr6yjWNIr+LYRY6/Ip2vWcMVjleEpTFznXrm83hrJ0n0INtyox\n' +
    'Nass4eDWkgo6ItxDFFLOORSmpfrToxZymSosWqgux/qG6sxHvLqlqy6Xe3ZYRFbG\n' +
    '+JcA1oGdwOg/c0ndr6BYYiXTh8+uUJfEoZvzABEBAAG0HEJsYSBCbGEgPGJsYWJs\n' +
    'YUBleGFtcGxlLm9yZz6JAVQEEwEIAD4WIQR4A0lIun9dDpvbZ+T2N5DBHmAnigUC\n' +
    'Ww+8rQIbAwUJA8JnAAULCQgHAgYVCgkICwIEFgIDAQIeAQIXgAAKCRD2N5DBHmAn\n' +
    'igwIB/9K3E3Yev9taZP4KnXPhk1oMQRW1MWAsFGUr+70N85VwedpUawymW4vXi1+\n' +
    'hMeTc39QjmZ0+VqHkJttkqEN6bLcEvgmU/mOlOgKdzy6eUcasYAzgoAKUqSX1SPs\n' +
    '0Imo7Tj04wnfnVwvKxaeadi0VmdqIYaW75UlrzIaltsBctyeYH8sBrvaTLscb4ON\n' +
    '46OM3Yw2G9+dBF0P+4UYFHP3EYZMlzNxfwF+i2HsYcNDHlcLfjENr9GwKn5FJqpY\n' +
    'Iq3qmI37w1hVasHDxXdz1X06dpsa6Im4ACk6LXa7xIQlXxTgPAQV0sz2yB5eY+Md\n' +
    'uzEXPGW+sq0WRp3hynn7kVP6QQYvuQENBFsPvK0BCACwvBcmbnGJk8XhEBRu2QN3\n' +
    'jKgVs3CG5nE2Xh20JipZwAuGHugDLv6/jlizzz5jtj3SAHVtJB8lJW8I0cNSEIX8\n' +
    'bRYH4C7lP2DTb9CgMcGErQIyK480+HIsbsZhJSNHdjUUl6IPEEVfSQzWaufmuswe\n' +
    'e+giqHiTsaiW20ytXilwVGpjlHBaxn/bpskZ0YRasgnPqKgJD3d5kunNqWoyCpMc\n' +
    'FYgDERvPbhhceFbvFE9G/u3gbcuV15mx53dDX0ImvPcvJnDOyJS9yr7ApdOV312p\n' +
    'A1MLbxfPnbnVu+dGXn7D/VCDd5aBYVPm+5ANrk6z9lYKH9aO5wgXpLAdJvutCOL5\n' +
    'ABEBAAGJATwEGAEIACYWIQR4A0lIun9dDpvbZ+T2N5DBHmAnigUCWw+8rQIbDAUJ\n' +
    'A8JnAAAKCRD2N5DBHmAnigMVB/484G2+3R0cAaj3V/z4gW3MRSMhcYqEMyJ/ACdo\n' +
    '7y8eoreYW843JWWVDRY6/YcYYGuBBP47WO4JuP2wIlVn17XOCSgnNjmmjsIYiAzk\n' +
    'op772TB27o0VeiFX5iWcawy0EI7JCb23xpI+QP31ksL2yyRYFXCtXSUfcOrLpCY8\n' +
    'aEQMQbAGtkag1wHTo/Tf/Vip8q0ZEQ4xOKTR2/ll6+inP8kzGyzadElUnH1Q1OUX\n' +
    'd2Lj/7BpBHE2++hAjBQRgnyaONF7mpUNEuw64iBNs0Ce6Ki4RV2+EBLnFubnFNRx\n' +
    'fFJcYXcijhuf3YCdWzqYmPpU/CtF4TgDlfSsdxHxVOmnZkY3\n' +
    '=qP6s\n' +
    '-----END PGP PUBLIC KEY BLOCK-----\n',

    keyChangedUserId: '-----BEGIN PGP PUBLIC KEY BLOCK-----\n' +
    '\n' +
    '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\n' +
    '=9WZ7\n' +
    '-----END PGP PUBLIC KEY BLOCK-----\n'
};