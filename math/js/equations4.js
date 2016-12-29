
var numVariable = 4;
var UNUSABLE = navigator.language.slice(0, 2) === "zh" ? "不可用" : "Unusable";
var constants = {
    "a-add-b": { object: null, used: false, inferred: false, value: NaN },
    "a-sub-b": { object: null, used: false, inferred: false, value: NaN },
    "a-add-c": { object: null, used: false, inferred: false, value: NaN },
    "a-sub-c": { object: null, used: false, inferred: false, value: NaN },
    "a-add-d": { object: null, used: false, inferred: false, value: NaN },
    "a-sub-d": { object: null, used: false, inferred: false, value: NaN },
    "b-add-c": { object: null, used: false, inferred: false, value: NaN },
    "b-sub-c": { object: null, used: false, inferred: false, value: NaN },
    "b-add-d": { object: null, used: false, inferred: false, value: NaN },
    "b-sub-d": { object: null, used: false, inferred: false, value: NaN },
    "c-add-d": { object: null, used: false, inferred: false, value: NaN },
    "c-sub-d": { object: null, used: false, inferred: false, value: NaN }
};
var inference = {
    "a-add-b,a-add-c": "b-sub-c",
    "a-add-b,b-sub-c": "a-add-c",
    "a-add-c,b-sub-c": "a-add-b",

    "a-add-b,a-sub-c": "b-add-c",
    "a-add-b,b-add-c": "a-sub-c",
    "a-sub-c,b-add-c": "a-add-b",

    "a-add-b,a-add-d": "b-sub-d",
    "a-add-b,b-sub-d": "a-add-d",
    "a-add-d,b-sub-d": "a-add-b",

    "a-add-b,a-sub-d": "b-add-d",
    "a-add-b,b-add-d": "a-sub-d",
    "a-sub-d,b-add-d": "a-add-b",

    "a-add-c,a-sub-b": "b-add-c",
    "a-add-c,b-add-c": "a-sub-b",
    "a-sub-b,b-add-c": "a-add-c",

    "a-sub-b,a-sub-c": "b-sub-c",
    "a-sub-b,b-sub-c": "a-sub-c",
    "a-sub-c,b-sub-c": "a-sub-b",

    "a-add-d,a-sub-b": "b-add-d",
    "a-add-d,b-add-d": "a-sub-b",
    "a-sub-b,b-add-d": "a-add-d",

    "a-sub-b,a-sub-d": "b-sub-d",
    "a-sub-b,b-sub-d": "a-sub-d",
    "a-sub-d,b-sub-d": "a-sub-b",

    "a-add-c,a-add-d": "c-sub-d",
    "a-add-c,c-sub-d": "a-add-d",
    "a-add-d,c-sub-d": "a-add-c",

    "a-add-c,a-sub-d": "c-add-d",
    "a-add-c,c-add-d": "a-sub-d",
    "a-sub-d,c-add-d": "a-add-c",

    "a-add-d,a-sub-c": "c-add-d",
    "a-add-d,c-add-d": "a-sub-c",
    "a-sub-c,c-add-d": "a-add-d",

    "a-sub-c,a-sub-d": "c-sub-d",
    "a-sub-c,c-sub-d": "a-sub-d",
    "a-sub-d,c-sub-d": "a-sub-c",

    "b-add-c,b-add-d": "c-sub-d",
    "b-add-c,c-sub-d": "b-add-d",
    "b-add-d,c-sub-d": "b-add-c",

    "b-add-c,b-sub-d": "c-add-d",
    "b-add-c,c-add-d": "b-sub-d",
    "b-sub-d,c-add-d": "b-add-c",

    "b-add-d,b-sub-c": "c-add-d",
    "b-add-d,c-add-d": "b-sub-c",
    "b-sub-c,c-add-d": "b-add-d",

    "b-sub-c,b-sub-d": "c-sub-d",
    "b-sub-c,c-sub-d": "b-sub-d",
    "b-sub-d,c-sub-d": "b-sub-c",
};

var inactive = function (id) {
    // isUsed[id] = false;
    $('#equation-' + id).removeClass("text-primary").addClass("text-muted");
    constants[id].object.prop("disabled", true).prop("placeholder", UNUSABLE).val("");
};

var active = function (id) {
    $('#equation-' + id).removeClass("text-muted").addClass("text-primary");
    constants[id].object.prop("disabled", false).prop("placeholder", "");
};

var toFourDigits = function (num) {
    return (Math.round(num * 10000)) / 10000;
}

var showResult = function (a, b, c, d) {
    $('#result-a').text(toFourDigits(a));
    $('#result-b').text(toFourDigits(b));
    if (numVariable > 2) {
        $('#result-c').text(toFourDigits(c));
    }
    if (numVariable > 3) {
        $('#result-d').text(toFourDigits(d));
    }
};

var solve2 = function (a_add_b, a_sub_b) {
    var a = (a_add_b + a_sub_b) / 2;
    var b = (a_add_b - a_sub_b) / 2;
    return [a, b];
};

var solve3 = function (a_add_b, a_sub_b, a_add_c, a_sub_c, b_add_c, b_sub_c) {
    var a = NaN, b = NaN, c = NaN, simpleSituation = false;

    if (!isNaN(a_add_b) && !isNaN(a_sub_b)) {
        var temp = solve2(a_add_b, a_sub_b);
        a = temp[0];
        b = temp[1];
        simpleSituation = true;
    } else if (!isNaN(a_add_c) && !isNaN(a_sub_c)) {
        var temp = solve2(a_add_c, a_sub_c);
        a = temp[0];
        c = temp[1];
        simpleSituation = true;
    } else if (!isNaN(b_add_c) && !isNaN(b_sub_c)) {
        var temp = solve2(b_add_c, b_sub_c);
        b = temp[0];
        c = temp[1];
        simpleSituation = true;
    }

    if (simpleSituation) {
        if (!isNaN(a_add_b) && isNaN(a)) {
            a = a_add_b - b;
        } else if (!isNaN(a_add_b) && isNaN(b)) {
            b = a_add_b - a;
        } else if (!isNaN(a_sub_b) && isNaN(a)) {
            a = a_sub_b + b;
        } else if (!isNaN(a_sub_b) && isNaN(b)) {
            b = a - a_sub_b;
        } else if (!isNaN(a_add_c) && isNaN(a)) {
            a = a_add_c - c;
        } else if (!isNaN(a_add_c) && isNaN(c)) {
            c = a_add_c - a;
        } else if (!isNaN(a_sub_c) && isNaN(a)) {
            a = a_sub_c + c;
        } else if (!isNaN(a_sub_c) && isNaN(c)) {
            c = a - a_sub_c;
        } else if (!isNaN(b_add_c) && isNaN(b)) {
            b = b_add_c - c;
        } else if (!isNaN(b_add_c) && isNaN(c)) {
            c = b_add_c - b;
        } else if (!isNaN(b_sub_c) && isNaN(b)) {
            b = b_sub_c + c;
        } else if (!isNaN(b_sub_c) && isNaN(c)) {
            c = b - b_sub_c;
        }

        return [a, b, c];
    }

    if (!isNaN(a_add_b)) {
        if (!isNaN(a_add_c)) {
            if (!isNaN(b_add_c)) {
                a_sub_b = a_add_c - b_add_c;
                var temp = solve2(a_add_b, a_sub_b);
                a = temp[0];
                b = temp[1];
                c = a_add_c - a;
            } else { // bmc != null
                console.log("Conflict");
                return [];
            }
        } else { // amc != null
            if (!isNaN(b_add_c)) {
                console.log("Conflict");
                return [];
            } else { // bmc != null
                a_sub_b = a_sub_c - b_sub_c;
                var temp = solve2(a_add_b, a_sub_b);
                a = temp[0];
                b = temp[1];
                c = a - a_sub_c;
            }
        }
    } else { // amb != null
        if (!isNaN(a_add_c)) {
            if (!isNaN(b_add_c)) {
                console.log("Conflict");
                return [];
            } else { // bmc != null
                a_add_b = a_add_c + b_sub_c;
                var temp = solve2(a_add_b, a_sub_b);
                a = temp[0];
                b = temp[1];
                c = a_add_c - a;
            }
        } else { // amc != null
            if (!isNaN(b_add_c)) {
                a_add_b = a_sub_c + b_add_c;
                var temp = solve2(a_add_b, a_sub_b);
                a = temp[0];
                b = temp[1];
                c = a - a_sub_c;
            } else { // bmc != null
                console.log("Conflict");
                return [];
            }
        }
    }

    return [a, b, c];
};

var solve4 = function () {
    var a_add_b = constants["a-add-b"].value;
    var a_sub_b = constants["a-sub-b"].value;
    var a_add_c = constants["a-add-c"].value;
    var a_sub_c = constants["a-sub-c"].value;
    var a_add_d = constants["a-add-d"].value;
    var a_sub_d = constants["a-sub-d"].value;
    var b_add_c = constants["b-add-c"].value;
    var b_sub_c = constants["b-sub-c"].value;
    var b_add_d = constants["b-add-d"].value;
    var b_sub_d = constants["b-sub-d"].value;
    var c_add_d = constants["c-add-d"].value;
    var c_sub_d = constants["c-sub-d"].value;
    var a = NaN, b = NaN, c = NaN, d = NaN;

    if (!isNaN(a_add_b) && !isNaN(a_sub_b) && !isNaN(c_add_d) && !isNaN(c_sub_d)) {
        var temp = solve2(a_add_b, a_sub_b);
        a = temp[0];
        b = temp[1];
        var temp2 = solve2(c_add_d, c_sub_d);
        c = temp2[0];
        d = temp2[1];
        return [a, b, c, d];
    }

    if (!isNaN(a_add_c) && !isNaN(a_sub_c) && !isNaN(b_add_d) && !isNaN(b_sub_d)) {
        var temp = solve2(a_add_c, a_sub_c);
        a = temp[0];
        c = temp[1];
        var temp2 = solve2(b_add_d, b_sub_d);
        b = temp2[0];
        d = temp2[1];
        return [a, b, c, d];
    }

    if (!isNaN(a_add_d) && !isNaN(a_sub_d) && !isNaN(b_add_c) && !isNaN(b_sub_c)) {
        var temp = solve2(a_add_d, a_sub_d);
        a = temp[0];
        d = temp[1];
        var temp2 = solve2(b_add_c, b_sub_c);
        b = temp2[0];
        c = temp2[1];
        return [a, b, c, d];
    }

    var computed = false;

    do {
        var nonNaNWithoutD = !isNaN(a_add_b) + !isNaN(a_sub_b) + !isNaN(a_add_c) + !isNaN(a_sub_c) + !isNaN(b_add_c) + !isNaN(b_sub_c);
        if (nonNaNWithoutD == 4) {
            console.log("Conflict");
            return [];
        }
        if (nonNaNWithoutD == 3) {
            var temp = solve3(a_add_b, a_sub_b, a_add_c, a_sub_c, b_add_c, b_sub_c);
            a = temp[0];
            b = temp[1];
            c = temp[2];
            // apb = amb = apc = amc = bpc = bmc = null;
            computed = true;
            break;
        }

        var nonNaNWithoutC = !isNaN(a_add_b) + !isNaN(a_sub_b) + !isNaN(a_add_d) + !isNaN(a_sub_d) + !isNaN(b_add_d) + !isNaN(b_sub_d);
        if (nonNaNWithoutC == 4) {
            console.log("Conflict");
            return [];
        }
        if (nonNaNWithoutC == 3) {
            var temp = solve3(a_add_b, a_sub_b, a_add_d, a_sub_d, b_add_d, b_sub_d);
            a = temp[0];
            b = temp[1];
            d = temp[2];
            // apb = amb = apd = amd = bpd = bmd = null;
            computed = true;
            break;
        }

        var nonNaNWithoutB = !isNaN(a_add_c) + !isNaN(a_sub_c) + !isNaN(a_add_d) + !isNaN(a_sub_d) + !isNaN(c_add_d) + !isNaN(c_sub_d);
        if (nonNaNWithoutB == 4) {
            console.log("Conflict");
            return [];
        }
        if (nonNaNWithoutB == 3) {
            var temp = solve3(a_add_c, a_sub_c, a_add_d, a_sub_d, c_add_d, c_sub_d);
            a = temp[0];
            c = temp[1];
            d = temp[2];
            // apc = amc = apd = amd = cpd = cmd = null;
            computed = true;
            break;
        }

        var nonNaNWithoutA = !isNaN(b_add_c) + !isNaN(b_sub_c) + !isNaN(b_add_d) + !isNaN(b_sub_d) + !isNaN(c_add_d) + !isNaN(c_sub_d);
        if (nonNaNWithoutA == 4) {
            console.log("Conflict");
            return [];
        }
        if (nonNaNWithoutA == 3) {
            var temp = solve3(b_add_c, b_sub_c, b_add_d, b_sub_d, c_add_d, c_sub_d);
            b = temp[0];
            c = temp[1];
            d = temp[2];
            // bpc = bmc = bpd = bmd = cpd = cmd = null;
            computed = true;
            break;
        }

    } while (false);

    if (computed) {
        if (!isNaN(a_add_b) && isNaN(a)) {
            a = a_add_b - b;
        } else if (!isNaN(a_add_b) && isNaN(b)) {
            b = a_add_b - a;
        } else if (!isNaN(a_sub_b) && isNaN(a)) {
            a = a_sub_b + b;
        } else if (!isNaN(a_sub_b) && isNaN(b)) {
            b = a - a_sub_b;
        } else if (!isNaN(a_add_c) && isNaN(a)) {
            a = a_add_c - c;
        } else if (!isNaN(a_add_c) && isNaN(c)) {
            c = a_add_c - a;
        } else if (!isNaN(a_sub_c) && isNaN(a)) {
            a = a_sub_c + c;
        } else if (!isNaN(a_sub_c) && isNaN(c)) {
            c = a - a_sub_c;
        } else if (!isNaN(a_add_d) && isNaN(a)) {
            a = a_add_d - d;
        } else if (!isNaN(a_add_d) && isNaN(d)) {
            d = a_add_d - a;
        } else if (!isNaN(a_sub_d) && isNaN(a)) {
            a = a_sub_d + d;
        } else if (!isNaN(a_sub_d) && isNaN(d)) {
            d = a - a_sub_d;
        } else if (!isNaN(b_add_c) && isNaN(b)) {
            b = b_add_c - c;
        } else if (!isNaN(b_add_c) && isNaN(c)) {
            c = b_add_c - b;
        } else if (!isNaN(b_sub_c) && isNaN(b)) {
            b = b_sub_c + c;
        } else if (!isNaN(b_sub_c) && isNaN(c)) {
            c = b - b_sub_c;
        } else if (!isNaN(b_add_d) && isNaN(b)) {
            b = b_add_d - d;
        } else if (!isNaN(b_add_d) && isNaN(d)) {
            d = b_add_d - b;
        } else if (!isNaN(b_sub_d) && isNaN(b)) {
            b = b_sub_d + d;
        } else if (!isNaN(b_sub_d) && isNaN(d)) {
            d = b - b_sub_d;
        } else if (!isNaN(c_add_d) && isNaN(c)) {
            c = c_add_d - d;
        } else if (!isNaN(c_add_d) && isNaN(d)) {
            d = c_add_d - c;
        } else if (!isNaN(c_sub_d) && isNaN(c)) {
            c = c_sub_d + d;
        } else if (!isNaN(c_sub_d) && isNaN(d)) {
            d = c - c_sub_d;
        }

        return [a, b, c, d];
    }

    if (isNaN(a_add_b) && isNaN(a_sub_b)) {
        // a - c - b - d 形成环，环上相邻两个未知数之间有且仅有一条方程。下同
        if (!isNaN(a_add_c)) {
            if (!isNaN(a_add_d)) {
                c_sub_d = a_add_c - a_add_d;
            } else { // a_sub_d
                c_add_d = a_add_c - a_sub_d;
            }
        } else { // a_sub_c
            if (!isNaN(a_add_d)) {
                c_add_d = a_add_d - a_sub_c;
            } else { // a_sub_d
                c_sub_d = a_sub_d - a_sub_c;
            }
        }
    } else if (isNaN(a_add_c) && isNaN(a_sub_c)) {
        // a - b - c - d 形成环
        if (!isNaN(a_add_b)) {
            if (!isNaN(a_add_d)) {
                b_sub_d = a_add_b - a_add_d;
            } else { // a_sub_d
                b_add_d = a_add_b - a_sub_d;
            }
        } else { // a_sub_b
            if (!isNaN(a_add_d)) {
                b_add_d = a_add_b - a_sub_b;
            } else { // a_sub_d
                b_sub_d = a_sub_d - a_sub_b;
            }
        }
    } else if (isNaN(a_add_d) && isNaN(a_sub_d)) {
        // a - b - d - c 形成环
        if (!isNaN(a_add_b)) {
            if (!isNaN(a_add_c)) {
                b_sub_c = a_add_b - a_add_c;
            } else { // a_sub_c
                b_add_c = a_add_b - a_sub_c;
            }
        } else { // a_sub_b
            if (!isNaN(a_add_c)) {
                b_add_c = a_add_c - a_sub_b;
            } else { // a_sub_c
                b_sub_c = a_sub_c - a_sub_b;
            }
        }
    }

    var temp = solve3(b_add_c, b_sub_c, b_add_d, b_sub_d, c_add_d, c_sub_d);
    b = temp[0];
    c = temp[1];
    d = temp[2];
    if (!isNaN(a_add_b)) {
        a = a_add_b - b;
    } else if (!isNaN(a_sub_b)) {
        a = a_sub_b + b;
    } else if (!isNaN(a_add_c)) {
        a = a_add_c - c;
    } else {
        a = a_sub_c + c;
    }

    return [a, b, c, d];
};

var trySolve = function () {
    var numUsed = 0;
    for (var id in constants) {
        if (constants[id].used) {
            if (constants[id].object.is(":visible")) {
                numUsed++;
            }
        } else {
            constants[id].value = NaN;
        }
    }
    if (numUsed < numVariable) {
        $('.result').text("");
        return;
    }

    switch (numVariable) {
        case 2:
            var result = solve2(constants["a-add-b"].value, constants["a-sub-b"].value);
            showResult(result[0], result[1]);
            break;
        case 3:
            var result = solve3(
                constants["a-add-b"].value, constants["a-sub-b"].value,
                constants["a-add-c"].value, constants["a-sub-c"].value,
                constants["b-add-c"].value, constants["b-sub-c"].value
            );
            showResult(result[0], result[1], result[2]);
            break;
        case 4:
            var result = solve4();
            showResult(result[0], result[1], result[2], result[3]);
    }
};

var updateUsability = function () {
    var useds = [];
    var numUsed = 0;
    for (var id in constants) {
        constants[id].inferred = false;
        if (constants[id].used && constants[id].object.is(":visible")) {
            if (numUsed < numVariable) {
                useds.push(id);
                numUsed++;
            } else {
                constants[id].object.val("");
                constants[id].used = false;
            }
        }
    }

    if (numUsed === numVariable) {
        for (var id in constants) {
            if (!constants[id].used) {
                constants[id].inferred = true;
            }
        }
    } else {
        while (useds.length > 0) {
            var id1 = useds.pop();
            useds.forEach(function (id2) {
                var keyId = id1 < id2 ? id1 + "," + id2 : id2 + "," + id1;
                var valueId = inference[keyId];
                if (valueId) {
                    if (!constants[valueId].used && !constants[valueId].inferred) {
                        useds.push(valueId);
                        constants[valueId].inferred = true;
                    }
                }
            });
        }
    }

    for (var id in constants) {
        if (constants[id].inferred) {
            inactive(id);
        } else {
            active(id);
        }
    }
};

var onChange = function (id, value) {
    constants[id].value = parseFloat(value);
    var used = (value !== "");
    if (used ^ constants[id].used) {
        constants[id].used = used;
        updateUsability();
    }
    trySolve();
};

var main = function () {
    $('#two-v-button').click(function () {
        numVariable = 2;
        $('.three-v-equations').hide();
        $('.four-v-equations').hide();
        updateUsability();
        trySolve();
     });
    $('#three-v-button').click(function () {
        numVariable = 3;
        $('.three-v-equations').show();
        $('.four-v-equations').hide();
        updateUsability();
        trySolve();
    });
    $('#four-v-button').click(function () {
        numVariable = 4;
        $('.three-v-equations').show();
        $('.four-v-equations').show();
        updateUsability();
        trySolve();
    });

    //init constants
    for (var id in constants) {
        constants[id].object = $('#constant-' + id);
    }

    $('.equation input').change(function () {
        var id = $(this).prop("id").substring(9);
        onChange(id, $(this).val());
    });
    $('.equation input').keyup(function () {
        var id = $(this).prop("id").substring(9);
        onChange(id, $(this).val());
    });
};

$(document).ready(main);