var canvas, renderer, scene, camera;
var points, lineMeshes;

var options = function() {
    this.numOfLines = Math.floor(canvas.clientHeight / 50);
    this.numOfPoints = 500;
    this.lineColor = 0x000000;
    this.lineWidth = 1.5;
    this.backgroundColor = 0xffffff;
    this.distanceFromScene = canvas.clientHeight;
    this.horizontal = 0;
    this.vertical = 0;
    this.zRotation = 0;
    this.xRotation = 0;
    this.yRotation = 0;
    this.xTimeSlowFactor = 1000;
    this.yTimeSlowFactor = 1000;
    this.xSmoothFactor = 2;
    this.ySmoothFactor = 2;
    this.amplitude = 90;
    this.spacingFactor = 70;
    this.useMesh = false;
}

function init() {
    window.addEventListener('resize', onWindowResize, false);

    canvas = document.querySelector("#canvas");
    noise.seed(2);

    options = new options();

    const gui = new dat.GUI({ autoPlace: true });

    gui.addColor(options, "backgroundColor").onChange(updateBackgroundColor);

    const distanceFolder = gui.addFolder("distance");
    distanceFolder.add(options, "distanceFromScene", 0, 5000).onChange(changeDistance);
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
    speedFolder.add(options, "xTimeSlowFactor", 0, 20000);
    speedFolder.add(options, "yTimeSlowFactor", 0, 20000);
    speedFolder.add(options, "xSmoothFactor", 0, 1000);
    speedFolder.add(options, "ySmoothFactor", 0, 1000);
    speedFolder.add(options, "amplitude", 0, 1000);

    gui.add(options, "useMesh").onChange(updateLineMeshArray);



    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });

    camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 1, 10000);
    camera.position.set(0, 0, options.distanceFromScene);
    camera.rotation.z = options.zRotation;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(options.backgroundColor);

    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();

    lineMeshes = [];
    for (var i = 0; i < options.numOfLines; i++) {
        var line = createLine(i);
        lineMeshes.push(line);
        scene.add(line);
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
}

function changeDistance() {
    camera.position.set(options.horizontal, options.vertical, options.distanceFromScene);
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

    const linePoints = new THREE.BufferGeometry().setFromPoints(new THREE.SplineCurve(points).getPoints(options.numOfPoints));
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
        lineMeshes[i].position.y = i * options.spacingFactor - options.numOfLines * options.spacingFactor / 2;
    }
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
}

function onWindowResize() {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
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

}

function mainLoop() {
    init();
    animate();
}

mainLoop();