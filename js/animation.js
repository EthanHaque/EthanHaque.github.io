var canvas, renderer, scene, camera;
var points, lineMeshes;
var gui;
var stats;
var options;
var orgOptions

var testing = true;

function init() {
    window.addEventListener('resize', onWindowResize, false);

    canvas = document.querySelector("#canvas");

    options = {
        bigTextColor: 0x000000,
        bigTextShadowColor: 0x000000,
        smallTextColor: 0x000000,
        numOfLines: 0,
        numOfPoints: 0,
        lineColor: 0x000000,
        lineWidth: 0,
        backgroundColor: 0x000000,
        distanceFromScene: 0,
        distanceScale: 0,
        horizontal: 0,
        vertical: 0,
        zRotation: 0,
        xRotation: 0,
        yRotation: 0,
        xTimeSlowFactor: 0,
        yTimeSlowFactor: 0,
        xSmoothFactor: 0,
        ySmoothFactor: 0,
        amplitude: 0,
        spacingFactor: 0,
        useMesh: false,
        settings: ""
    }
    noise.seed(2);

    updateSettings(options);
    if (testing) {
        gui = createGUI();
        stats = new Stats();
        stats.setMode(0);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0';
        stats.domElement.style.top = '0';
        document.body.appendChild(stats.domElement);
    }


    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });

    camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 1, 10000);
    camera.position.set(0, 0, options.distanceFromScene);
    camera.rotation.z = options.zRotation;

    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(options.backgroundColor);

    lineMeshes = [];

    var request = new XMLHttpRequest();
    request.open("GET", "https://ethanhaque.github.io/presets.json");
    request.responseType = 'json';
    request.send();
    request.onload = function () {
        data = request.response.presets;
        var choice = data[Math.floor(Math.random() * data.length)]
        options.settings = choice;
        importSettings();
        orgOptions = JSON.parse(JSON.stringify(options));
        if (canvas.clientWidth <= 800) {
            options.distanceScale = 1;
            changeDistance();
        }
    }


}

function createGUI() {
    var gui = new dat.GUI({
        autoPlace: true
    });

    gui.addColor(options, "backgroundColor").onChange(updateBackgroundColor);

    const textFolder = gui.addFolder("text");
    textFolder.addColor(options, "bigTextColor").onChange(updateTextColor);
    textFolder.addColor(options, "bigTextShadowColor").onChange(updateTextColor);
    textFolder.addColor(options, "smallTextColor").onChange(updateTextColor);


    const distanceFolder = gui.addFolder("distance");
    distanceFolder.add(options, "distanceFromScene", 0, 5000).onChange(changeDistance);
    distanceFolder.add(options, "distanceScale", 0, 100).onChange(changeDistance);
    distanceFolder.add(options, "horizontal", -5000, 5000).onChange(changeDistance);
    distanceFolder.add(options, "vertical", -5000, 5000).onChange(changeDistance);

    const linesFolder = gui.addFolder("Lines");
    linesFolder.add(options, "numOfLines", 0, 5000).onChange(updateLineMeshArray);
    linesFolder.add(options, "numOfPoints", 0, 10000).onChange(updateLineMeshArray);
    linesFolder.add(options, "spacingFactor", 0, 100).onChange(updateLinePosition);
    linesFolder.add(options, "lineWidth", 0, 100).onChange(function update() {
        if (options.useMesh) {
            updateLineMeshArray();
        }
    });
    linesFolder.addColor(options, "lineColor").onChange(updateLineColor);


    const rotationFolder = gui.addFolder("Rotation");
    rotationFolder.add(options, "xRotation", 0, 2 * Math.PI).onChange(updateLineRotation);
    rotationFolder.add(options, "yRotation", 0, 2 * Math.PI).onChange(updateLineRotation);
    rotationFolder.add(options, "zRotation", 0, 2 * Math.PI).onChange(updateLineRotation);

    const speedFolder = gui.addFolder("Speed");
    speedFolder.add(options, "xTimeSlowFactor", 0, 20000).onChange(updateGUI);
    speedFolder.add(options, "yTimeSlowFactor", 0, 20000).onChange(updateGUI);
    speedFolder.add(options, "xSmoothFactor", 0, 1000).onChange(updateGUI);
    speedFolder.add(options, "ySmoothFactor", 0, 1000).onChange(updateGUI);
    speedFolder.add(options, "amplitude", 0, 1000).onChange(updateGUI);

    gui.add(options, "useMesh").onChange(updateLineMeshArray);

    gui.add(options, "settings");
    gui.add({
        importSettings: importSettings
    }, "importSettings");

    return gui;
}

function importSettings() {
    readInSettings(options.settings);
    updateLineMeshArray();
    updateBackgroundColor();
    updateTextColor();
    changeDistance();
    updateLineRotation();
    updateLineColor();
    if (testing) {
        updateGUI();
    }
}

function updateGUI() {
    updateSettings(options);
    for (var i in gui.__controllers) {
        gui.__controllers[i].updateDisplay();
    }

    for (var i = 0; i < Object.keys(gui.__folders).length; i++) {
        var key = Object.keys(gui.__folders)[i];
        for (var j = 0; j < gui.__folders[key].__controllers.length; j++) {
            gui.__folders[key].__controllers[j].updateDisplay();
        }
    }

}

function createSettings(options) {
    var settingsStr = "";
    for (var option in options) {
        if (option !== "settings") {
            settingsStr += option + ":" + options[option] + ","
        }
    }
    return settingsStr.slice(0, -1);
}

function updateSettings(opts) {
    var settings = createSettings(opts);
    options.settings = settings;
}

function readInSettings(settings) {
    var strArr = settings.split(",");
    for (var i = 0; i < strArr.length; i++) {
        var pair = strArr[i].split(":");
        if (!isNaN(parseFloat(pair[1]))) {
            options[pair[0]] = parseFloat(pair[1]);
        } else if (pair[1] === "true" || pair[1] === "false") {
            options[pair[0]] = (pair[1] === "true" ? true : false);
        }
    }

}

function updateLineRotation() {
    for (var i = 0; i < lineMeshes.length; i++) {
        lineMeshes[i].rotation.x = options.xRotation;
        lineMeshes[i].rotation.y = options.yRotation;
        lineMeshes[i].rotation.z = options.zRotation;
    }
}

function updateLineColor() {
    for (var i = 0; i < lineMeshes.length; i++) {
        lineMeshes[i].material.color.set(options.lineColor);
    }
}

function updateBackgroundColor() {
    scene.background.set(options.backgroundColor);
    if (testing) {
        updateGUI()
    }
}

function updateTextColor() {
    bigText = document.getElementsByClassName("big");
    smallTextColor = document.getElementsByClassName("small");
    var diff = 0x050505;
    for (var i = 0; i < bigText.length; i++) {
        bigText[i].style.color = "#" + options.bigTextColor.toString(16);
        var textShadowColor1 = options.bigTextShadowColor;
        var textShadowColor2 = (textShadowColor1 - diff);
        var textShadowColor3 = (textShadowColor2 - diff);
        var textShadowColor4 = (textShadowColor3 - diff);
        var textShadowColor5 = (textShadowColor4 - diff);
        bigText[i].style.textShadow = `0 1px 0 ${"#" + textShadowColor1.toString(16)}, 0 2px 0 ${"#" + textShadowColor2.toString(16)}, 0 3px 0 ${"#" + textShadowColor3.toString(16)}, 0 4px 0 ${"#" + textShadowColor4.toString(16)}, 0 5px 0 ${"#" + textShadowColor5.toString(16)}, 0 6px 1px rgba(0, 0, 0, .1), 0 0 5px rgba(0, 0, 0, .1), 0 1px 3px rgba(0, 0, 0, .3), 0 3px 5px rgba(0, 0, 0, .2), 0 5px 10px rgba(0, 0, 0, .25), 0 10px 10px rgba(0, 0, 0, .2), 0 20px 20px rgba(0, 0, 0, .15)`;
    }

    for (var i = 0; i < smallTextColor.length; i++) {
        smallTextColor[i].style.color = "#" + options.smallTextColor.toString(16);
    }

    if (testing) {
        updateGUI()
    }
}

function changeDistance() {
    camera.position.set(options.horizontal, options.vertical, options.distanceFromScene * options.distanceScale);
    if (testing) {
        updateGUI()
    }
}

function createLine(pos) {
    points = [];
    for (var i = 0; i < options.numOfPoints; i++) {
        points.push(new THREE.Vector3(
            i * canvas.clientWidth / options.numOfPoints,
            0,
            0
        ));
    }

    const curve = new THREE.SplineCurve(points).getPoints(options.numOfPoints);
    const linePoints = new THREE.BufferGeometry().setFromPoints(curve);
    // const linePoints = new THREE.BufferGeometry().setFromPoints(points);
    var line;

    if (options.useMesh) {
        const obj = new MeshLine();
        obj.setGeometry(linePoints);
        const geometry = obj.geometry;

        const material = new MeshLineMaterial({
            lineWidth: options.lineWidth,
            color: new THREE.Color(options.lineColor)
        });

        line = new THREE.Mesh(geometry, material);
    } else {

        const material = new THREE.LineBasicMaterial({
            color: new THREE.Color(options.lineColor)
        });
        linePoints.computeBoundingSphere();
        line = new THREE.Line(linePoints, material);

    }

    line.position.x = -canvas.clientWidth / 2 + canvas.clientWidth / options.numOfPoints / 2;
    line.position.y = pos * options.spacingFactor - options.numOfLines * options.spacingFactor / 2;

    return line;

}

function updateLineMeshArray() {
    for (var i = 0; i < lineMeshes.length; i++) {
        lineMeshes[i].geometry.dispose();
        lineMeshes[i].material.dispose();
        scene.remove(lineMeshes[i]);
    }
    lineMeshes = []
    for (var i = 0; i < options.numOfLines; i++) {
        var line = createLine(i);
        lineMeshes.push(line);
        scene.add(line);
    }
    if (testing) {
        updateGUI();
    }
}

function updateLinePosition() {
    for (var i = 0; i < lineMeshes.length; i++) {
        lineMeshes[i].position.y = options.spacingFactor * (i - options.numOfLines / 2);
    }
    if (testing) {
        updateGUI();
    }
}

function onWindowResize() {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    if (canvas.clientWidth <= 800) {
        options.distanceScale = orgOptions.distanceScale / 2;
        changeDistance();
        if (testing) {
            updateGUI();
        }
    } else {
        options.distanceScale = orgOptions.distanceScale;
        changeDistance();
        if (testing) {
            updateGUI();
        }
    }
}

function render(time) {
    for (var j = 0; j < lineMeshes.length; j++) {
        var positions = lineMeshes[j].geometry.attributes.position.array;
        for (var i = 0; i < positions.length / 3; i++) {
            var x = i / options.xSmoothFactor + time / options.xTimeSlowFactor
            var y = j / options.ySmoothFactor + time / options.yTimeSlowFactor

            positions[i * 3 + 1] = options.amplitude * noise.perlin2(x, y);
        }
        lineMeshes[j].geometry.attributes.position.needsUpdate = true;
    }

    if (testing) {
        stats.update();
    }
}

function animate(time) {
    requestAnimationFrame(animate);
    render(time);

    renderer.render(scene, camera);
}

function mainLoop() {
    init();
    animate();
}

mainLoop();