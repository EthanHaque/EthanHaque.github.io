var canvas, renderer, scene, camera;
var points, lineMeshes;

var options = function() {
    this.noOfLines = 50;
    this.numOfPoints = 400;
    this.lineColor = new THREE.Color(0x09BC8A);
    this.backgroundColor = new THREE.Color(0x071A2A);
    this.distanceFromScene = this.numOfPoints / 2;
    this.zRotation = Math.PI / 6;
    this.xRotation = 0;
    this.yRotation = 0;
    this.timeSlowFactor = 8000;
    this.xSlowFactor = 200;
    this.ySlowFactor = 50;
    this.amplitude = 200;
    this.spacingFactor = 10;
}

function init() {
    canvas = document.querySelector("#canvas");
    noise.seed(2);

    options = new options();

    const gui = new dat.GUI({ autoPlace: true });

    gui.addColor(options, "backgroundColor").onChange(updateBackgroundColor);
    gui.add(options, "distanceFromScene", 0, 5000).onChange(changeDistance);

    const linesFolder = gui.addFolder("Lines");
    linesFolder.add(options, "noOfLines", 0, 500).onChange(updateLineMeshArray);
    linesFolder.add(options, "numOfPoints", 0, 1000).onChange(updateLineMeshArray);
    linesFolder.addColor(options, "lineColor").onChange(updateLineColor);
    linesFolder.add(options, "spacingFactor", 0, 100).onChange(updateLinePosition);

    const rotationFolder = gui.addFolder("Rotation");
    rotationFolder.add(options, "xRotation", 0, 2 * Math.PI).onChange(updateLineRotation);
    rotationFolder.add(options, "yRotation", 0, 2 * Math.PI).onChange(updateLineRotation);
    rotationFolder.add(options, "zRotation", 0, 2 * Math.PI).onChange(updateLineRotation);

    const speedFolder = gui.addFolder("Speed");
    speedFolder.add(options, "timeSlowFactor", 0, 20000);
    speedFolder.add(options, "xSlowFactor", 0, 1000);
    speedFolder.add(options, "ySlowFactor", 0, 1000);
    speedFolder.add(options, "amplitude", 0, 1000);



    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });

    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 10000);
    camera.position.set(0, 0, options.distanceFromScene);
    camera.rotation.z = options.zRotation;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x071A2A);

    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();

    lineMeshes = [];
    for (var i = 0; i < options.noOfLines; i++) {
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
        console.log(lineMeshes[i].material.color);
        lineMeshes[i].material.color.r = options.lineColor.r / 255;
        lineMeshes[i].material.color.b = options.lineColor.b / 255;
        lineMeshes[i].material.color.g = options.lineColor.g / 255;
        console.log(lineMeshes[i].material.color);

    }
}

function updateBackgroundColor() {
    scene.background.r = options.backgroundColor.r / 255;
    scene.background.b = options.backgroundColor.b / 255;
    scene.background.g = options.backgroundColor.g / 255;
}

function changeDistance() {
    camera.position.set(0, 0, options.distanceFromScene);
}

function createLine(pos) {
    points = [];
    for (var i = 0; i < options.numOfPoints; i++) {
        points.push(new THREE.Vector3(
            i,
            0,
            0
        ));
    }

    const linePoints = new THREE.BufferGeometry().setFromPoints(new THREE.SplineCurve(points).getPoints(100));
    const line = new MeshLine();
    line.setGeometry(linePoints);
    const geometry = line.geometry;

    const material = new MeshLineMaterial({
        lineWidth: 1,
        color: 0x09BC8A
    });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = -options.numOfPoints / 2;
    mesh.position.y = pos * options.spacingFactor - options.noOfLines * options.spacingFactor / 2;

    return mesh;
}

function updateLinePosition() {
    for (var i = 0; i < lineMeshes.length; i++) {
        lineMeshes[i].position.y = i * options.spacingFactor - options.noOfLines * options.spacingFactor / 2;
    }
}

function updateLineMeshArray() {
    for (var i = 0; i < lineMeshes.length; i++) {
        lineMeshes[i].geometry.dispose();
        lineMeshes[i].material.dispose();
        scene.remove(lineMeshes[i]);
    }
    lineMeshes = []
    for (var i = 0; i < options.noOfLines; i++) {
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
            var x = i / options.xSlowFactor + time / options.timeSlowFactor
            var y = j / options.ySlowFactor

            positions[i * 3 + 1] = options.amplitude * noise.perlin2(x, y);
        }
        lineMeshes[j].geometry.attributes.position.needsUpdate = true;
    }

}

function mainLoop() {
    init();
    animate();
}

mainLoop();