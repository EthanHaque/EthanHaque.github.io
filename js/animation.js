var canvas, renderer, scene, camera;
var points, lineMeshes;
var noOfLines = 50
var numOfPoints = 400;

function init() {
    canvas = document.querySelector("#canvas");
    noise.seed(2);

    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });

    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 10000);
    camera.position.set(0, 0, numOfPoints / 2);
    camera.rotation.z = Math.PI / 6;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x071A2A);

    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();

    lineMeshes = [];
    for (var i = 0; i < noOfLines; i++) {
        var line = createLine(i);
        lineMeshes.push(line);
        scene.add(line);
    }



}

function createLine(pos) {
    points = [];
    for (var i = 0; i < numOfPoints; i++) {
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
    mesh.position.x = -numOfPoints / 2;
    mesh.position.y = pos * 10 - noOfLines * 5;
    // mesh.rotation.y = Math.PI / 12;

    return mesh;
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
            var amplitude = 200
            var x = i / 250 + time / 8000
            var y = j / 50

            positions[i * 3 + 1] = amplitude * noise.perlin2(x, y);
        }
        lineMeshes[j].geometry.attributes.position.needsUpdate = true;
    }

}

function mainLoop() {
    init();
    animate();
}

mainLoop();