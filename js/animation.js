var canvas, renderer, scene, camera;
var points, lineMeshes;
var gui;
var stats;

var options;

function init() {
    window.addEventListener('resize', onWindowResize, false);

    canvas = document.querySelector("#canvas");

    options = {
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
    gui = createGUI();

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

    camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 1, 10000);
    camera.position.set(0, 0, options.distanceFromScene);
    camera.rotation.z = options.zRotation;

    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(options.backgroundColor);

    lineMeshes = [];
    for (var i = 0; i < options.numOfLines; i++) {
        var line = createLine(i);
        lineMeshes.push(line);
        scene.add(line);
    }

    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0';
    stats.domElement.style.top = '0';
    document.body.appendChild(stats.domElement);

    var data;
    var request = new XMLHttpRequest();
    request.open("GET", "https://ethanhaque.github.io/presets.json");
    request.responseType = 'json';
    request.send();
    request.onload = function () {
        data = request.response.presets;
        chooseSettings(data[Math.floor(Math.random() * data.length)]);
    }

}

function createGUI() {
    var gui = new dat.GUI({ autoPlace: true });

    gui.addColor(options, "backgroundColor").onChange(updateBackgroundColor);

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
        if (options.useMesh) { updateLineMeshArray(); }
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
    gui.add({ importSettings: importSettings }, "importSettings");

    return gui;
}

// 3 am testing. Fix this.
function chooseSettings(settings) {
    readInSettings(settings);
    updateLineMeshArray();
    updateBackgroundColor();
    changeDistance();
    updateLineRotation();
    updateLineColor();
    updateGUI();
}

function importSettings() {
    readInSettings(options.settings);
    updateLineMeshArray();
    updateBackgroundColor();
    changeDistance();
    updateLineRotation();
    updateLineColor();
    updateGUI();
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
        } else if (pair[0] === "true" || pair[0] === "false") {
            options[pair[0]] = (pair[0] === "true" ? true : false);
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
    updateGUI()
}

function changeDistance() {
    camera.position.set(options.horizontal, options.vertical, options.distanceFromScene * options.distanceScale);
    updateGUI()
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

    line.position.x = -canvas.clientWidth / 2;
    line.position.y = pos * options.spacingFactor - options.numOfLines * options.spacingFactor / 2;

    return line;

}

function updateLinePosition() {
    for (var i = 0; i < lineMeshes.length; i++) {
        lineMeshes[i].position.y = options.spacingFactor * (i - options.numOfLines / 2);
    }
    updateGUI()
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
    updateGUI();
}

function onWindowResize() {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    options.distanceFromScene = options.distanceScale * canvas.clientWidth / camera.aspect;
    changeDistance();
    camera.updateProjectionMatrix();

    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

}

function animate(time) {
    requestAnimationFrame(animate);


    render(time);

    renderer.render(scene, camera);

}

function render(time) {

    for (var j = 0; j < lineMeshes.length; j++) {
        var positions = lineMeshes[j].geometry.attributes.position.array;
        for (var i = 0; i < positions.length / 3; i++) {
            var x = i / options.xSmoothFactor + time / options.xTimeSlowFactor
            var y = j / options.ySmoothFactor + time / options.yTimeSlowFactor

            positions[i * 3 + 1] = options.amplitude * noise.perlin2(x, y) + 1;
        }
        lineMeshes[j].geometry.attributes.position.needsUpdate = true;
    }

    stats.update();
}

function mainLoop() {
    init();
    animate();
}

mainLoop();