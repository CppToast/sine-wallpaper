function col(rgb) {
    rgb = Math.floor(rgb);
    var hex = Number(rgb).toString(16);
    if (hex.length < 2) {
        hex = "0" + hex;
    }
    return hex;
}

function rgb(r, g, b) {
    var red = col(r);
    var green = col(g);
    var blue = col(b);
    return "#" + red + green + blue;
}

function hsv_to_rgb(h) {
    var r, g, b, hmod;
    h = Math.abs(h % 393216);
    hmod = h % 65536;

    if (h < 65536) {
        r = 65536;
        g = hmod;
        b = 0;
    }
    else if (h >= 65536 && h < 131072) {
        r = 65536 - hmod;
        g = 65536;
        b = 0;
    }
    else if (h >= 131072 && h < 196608) {
        r = 0;
        g = 65536;
        b = hmod;
    }
    else if (h >= 196608 && h < 262144) {
        r = 0;
        g = 65536 - hmod;
        b = 65536;
    }
    else if (h >= 262144 && h < 327680) {
        r = hmod;
        g = 0;
        b = 65536;
    }
    else {
        r = 65536
        g = 0;
        b = 65536 - hmod;
    }
    if (ccycle) {
        r = Math.sqrt(r) - 1; if (r < 0) { r = 0; }
        g = Math.sqrt(g) - 1; if (g < 0) { g = 0; }
        b = Math.sqrt(b) - 1; if (b < 0) { b = 0; }
    } else {
        r = (r / 65536) * 255;
        g = (g / 65536) * 255;
        b = (b / 65536) * 255;
    }
    return [r, g, b]
}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
const scr_x = window.innerWidth;
const scr_y = window.innerHeight;
canvas.width = scr_x;
canvas.height = scr_y;
const color_begin = 0;
const color_end = 393215;

var back_color = "#0f0f0f"
var thickness = scr_y / 20;
var position = scr_y / 2;
var str_x = 0.1;
var str_y = scr_y / 2 - thickness / 2;
var speed = 3;
var color_speed = Math.floor(8 / 100 * 1024);
var draw_step = 1;
var timer_increment = 2 * (50 / 100);
var cflow = 0;
var image_file;
var ccycle = 0;
var ccolor = 0;
var sin_color = "#ffffff"

var back_drawn;
var timer = 0;
setInterval(setTime, 10);
function setTime() { timer += timer_increment; }
var color_offset = Math.floor(Math.random() * 393215);
var color = color_begin;
var offset, color_offset, y, tcolor_r, tcolor_g, tcolor_b, tcolor, frames = 0;
var sine = new Array(scr_x);
var image;
color = Math.floor(Math.random() * 393215);
ctx.beginPath();
ctx.fillStyle = color;
ctx.fillRect(0, 0, scr_x, scr_y);

window.wallpaperPropertyListener = {
    applyUserProperties: function (properties) {
        if (properties.backgroundcolor) {
            var tcolor = properties.backgroundcolor.value.split(' ');
            back_color = rgb(parseFloat(tcolor[0]) * 255, parseFloat(tcolor[1]) * 255, parseFloat(tcolor[2]) * 255);
        }
        if (properties.schemecolor) {
            var tcolor = properties.schemecolor.value.split(' ');
            sin_color = rgb(parseFloat(tcolor[0]) * 255, parseFloat(tcolor[1]) * 255, parseFloat(tcolor[2]) * 255);
        }
        if (properties.colorspeed) { color_speed = Math.floor(properties.colorspeed.value / 100 * 1024); }
        if (properties.sinespeed) { timer_increment = 2 * (properties.sinespeed.value / 100); }
        if (properties.yposition) { position = scr_y * (properties.yposition.value / 100); }
        if (properties.xsize) { str_x = properties.xsize.value / scr_x; }
        if (properties.ysize) { str_y = scr_y * (properties.ysize.value / 100); }
        if (properties.sinethickness) { thickness = properties.sinethickness.value * (scr_y / 1000); }
        if (properties.drawstep) { draw_step = properties.drawstep.value; }
        if (properties.image) {
            if (properties.image.value) { image_file = properties.image.value; image_file = image_file.replace("%3A", ":"); back_drawn = 0; }
            else { image_file = null; back_drawn = 0; }
        }
        if (properties.flow) { cflow = properties.flow.value; back_drawn = 0; }
        if (properties.cycle) { ccycle = properties.cycle.value; }
        if (properties.customcolor) { ccolor = properties.customcolor.value; }
    }
};

window.onresize = function (event) { location.reload(); };

for (var x = 0; x < scr_x; x++) { sine[x] = (Math.sin(str_x * x * 0.017453) * str_y + position); }
window.requestAnimationFrame(draw);
var img = new Image;
function draw() {
    frames++;
    tcolor_r = hsv_to_rgb(color)[0];
    tcolor_g = hsv_to_rgb(color)[1];
    tcolor_b = hsv_to_rgb(color)[2];
    tcolor = rgb(tcolor_r, tcolor_g, tcolor_b);
    color += color_speed; if (color > color_end) { color %= color_end + 1; }
    if (!cflow || !back_drawn) {
        if (image_file == null || cflow) {
            if (cflow) { ctx.fillStyle = tcolor; } else { ctx.fillStyle = back_color; }
            ctx.fillRect(0, 0, scr_x, scr_y);
        } else {
            img.src = "file://" + image_file;
            ctx.drawImage(img, 0, 0, scr_x, scr_y)
        }
        back_drawn = 1;
    }
    for (var x = 0; x < scr_x; x += draw_step) {
        if (ccolor > 0) { ctx.fillStyle = sin_color; } else { ctx.fillStyle = tcolor; }
        ctx.fillRect(x, sine[x] - thickness / 2, draw_step, thickness);
    }
    for (var x = 0; x < scr_x; x++) { sine[x] = (Math.sin(str_x * (x + offset) * 0.017453) * str_y + position); }
    offset = -timer * speed;
    window.requestAnimationFrame(draw);
}
