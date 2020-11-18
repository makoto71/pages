import * as THREE from '../jsm/build/three.module.js';
import { EffectComposer } from '../jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../jsm/postprocessing/RenderPass.js';
import { BokehPass } from '../jsm/postprocessing/BokehPass.js';

//const EffectComposer = require("../jsm/postprocessing/EffectComposer.js")
//THREE.RenderPass = require("../jsm/postprocessing/RenderPass.js")
//const BokehPass = require("../jsm/postprocessing/BokehPass.js")

export class ParticleSphere {

    constructor(){
        this.CUBE_SIZE = 12;
        this.COL_LENGTH = 20;
        this.ROW_LENGTH = 5;
        this.STACK_SIZE = 10;
        this.active = false;
    }
    init(stage) {

        // シーン
        this.scene = new THREE.Scene();

        // レンダラー
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setClearColor(new THREE.Color(0xFFFFFF));

        stage.appendChild(this.renderer.domElement);

        // カメラ
        this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
        this.camera.position.set(0, 0, 20);

        // ライト
        /*
        var directionalLight = new THREE.DirectionalLight('#ffffff', 0.9);
        directionalLight.position.set(0, 1, 0);
        this.scene.add(directionalLight);

        var ambientLight = new THREE.AmbientLight('#ffffff', 0.7);
        this.scene.add(ambientLight);
        */

       this.lights = [];
       this.lights[0] = new THREE.DirectionalLight( 0x11E8BB, 0.3 );
       this.lights[0].position.set( 0.75, 0.5, 0.5 );
       this.lights[1] = new THREE.DirectionalLight( 0x8200C9, 0.3 );
       this.lights[1].position.set( -0.75, -0.5, 0.5 );
       //this.scene.add( lights[0] );
       this.scene.add( this.lights[0] );
       this.scene.add( this.lights[1] );

        // フォグ
        //this.scene.fog = new THREE.Fog(0xd4d4d4, 8, 20);
        //this.scene.fog = new THREE.Fog(0xeeeeee, 8, 1000);

        this.sphere = this.build_sphere();
        /*
        if (this.active){
            this.sphere.scale.x = 1;
            this.sphere.scale.y = 1;
            this.sphere.scale.z = 1;
        } else {
            this.sphere.scale.x = 10;
            this.sphere.scale.y = 10;
            this.sphere.scale.z = 10;
        }
        */

        this.scene.add(this.sphere);

        //this.star = this.starField();
        //this.scene.add(this.star);

        this.init_postprocessing();

        var self = this;
        function onWindowResize() {
            var windowHalfX = window.innerWidth / 2;
            var windowHalfY = window.innerHeight / 2;

            var width = window.innerWidth;
            var height = window.innerHeight;

            self.camera.aspect = width / height;
            self.camera.updateProjectionMatrix();

            self.renderer.setSize( width, height );
            self.postprocessing.composer.setSize( width, height );
        }

        window.addEventListener('resize', onWindowResize);
    }

    build_sphere(){

        var t = (1 + Math.sqrt(5)) / 2;
        var vertices = [-1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, 0,
        0, -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t,
        t, 0, -1, t, 0, 1, -t, 0, -1, -t, 0, 1
        ];

        var faces = [
        0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
        1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8,
        3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
        4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1
        ];
  
        // Create vertex points
        var radius = 5;
        var detail = 2;
        var wireframe_geometory = new THREE.PolyhedronGeometry(vertices, faces, radius, detail);

        // 線
        var wireframe_material = new THREE.MeshPhongMaterial({
            color: 0xcccccc,
            emissive: 0xcccccc,
            wireframe: true,
            fog: 5
        });

        /*
        var wireframe_material = new THREE.MeshPhongMaterial({
            color: 0x616161,
            emissive: 0xa1a1a1,
            wireframe: true,
            fog: 1
            });
            */

        var wireframe = new THREE.Mesh(wireframe_geometory, wireframe_material);

        // 点
        var vertices = wireframe_geometory.vertices;
        var positions = new Float32Array(vertices.length * 3);
        for (var i = 0, l = vertices.length; i < l; i++) {
            vertices[i].toArray(positions, i * 3);
        }
  
        var points_geometry = new THREE.BufferGeometry();
        points_geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        var points_material = new THREE.PointsMaterial({
            size: 0.2,
            //vertexColors: THREE.VertexColors,
            color: '#cccccc',
        });

        var points = new THREE.Points(points_geometry, points_material);
        
        
        var sphere = new THREE.Object3D();
        sphere.add(points);
        sphere.add(wireframe);

        return sphere
    }

    starField(){
        //空のジオメトリを作って
        const geometry = new THREE.Geometry();
        //表示する範囲を宣言して
        const SIZE = 300;
        //表示するパーティクルの数を決めて
        const LENGTH = 1000;
        //その数まで四方八方に表示させるループ処理をする
        for (let i = 0; i < LENGTH; i++){
            geometry.vertices.push(
                new THREE.Vector3(
                SIZE * (Math.random() - 0.5),
                SIZE * (Math.random() - 0.5),
                SIZE * (Math.random() - 0.5)
            )
            );
        }
        //マテリアルを作成、色とサイズも一緒に
        const material = new THREE.PointsMaterial({
            map: createCanvasMaterial('#aaaaaa', 256),
            //color: '#aaaaaa',
            transparent: true,
        depthWrite: false,
            size: 3
        });


        var wireframe_material = new THREE.MeshPhongMaterial({
            color: 0xcccccc,
            emissive: 0xcccccc,
            wireframe: true,
        });


        const mesh = new THREE.Points(geometry, material);
        mesh.position.z = 100;

        function createCanvasMaterial(color, size) {
            var matCanvas = document.createElement('canvas');
            matCanvas.width = matCanvas.height = size;
            var matContext = matCanvas.getContext('2d');
            // create exture object from canvas.
            var texture = new THREE.Texture(matCanvas);
            // Draw a circle
            var center = size / 2;
            matContext.beginPath();
            matContext.arc(center, center, size/2 - 10, 0, 2 * Math.PI, false);
            matContext.closePath();
            matContext.fillStyle = color;
            matContext.globalAlpha = 0.2;
            matContext.filter = "blur(8px)";
            matContext.fill();
            // need to set needsUpdate
            texture.needsUpdate = true;
            // return a texture made from the canvas
            return texture;
          }

        return mesh;
    }

    // PostProcessing
    init_postprocessing(){

        this.postprocessing = {};

        // composer
        var composer = new EffectComposer(this.renderer);

        // render pass
        var renderPass = new RenderPass(this.scene, this.camera);
        composer.addPass(renderPass);

        // 被写界深度
        var bokehSettings = {
            //focus : 15, aperture : 0.005,  maxblur : 0.005,
            focus : 15, aperture : 0.005,  maxblur : 0.005,
            width: window.innerWidth, height : window.innerHeight
        }

        var bokehPass =  new BokehPass(this.scene, this.camera, bokehSettings );
        bokehPass.renderToScreen = true;
        composer.addPass(bokehPass);

        this.postprocessing.composer = composer;
        this.postprocessing.bokeh = bokehPass;

        this.postprocessing.composer.render(0.2);
    }

    // レンダリング
    animate() {
        var self = this;
        var distance = 4
        function frame(){
            self.sphere.rotation.x += 0.001;
            self.sphere.rotation.y += 0.0005;

            /*
            self.star.rotation.x += 0.001;
            self.star.rotation.y += 0.003;
            self.star.rotation.z += 0.0001;
            */

            /*
           self.star.rotation.x += 0.003;
           self.star.rotation.y += 0.005;
           self.star.rotation.z += 0.00005;
           */

           //self.lights[0].intensity = Math.sin(self.star.rotation.x) * 0.5;
           //self.lights[1].intensity = Math.sin(self.star.rotation.x) * 0.5

           //self.star.material.opacity = Math.sin(self.star.rotation.x * 30) * 0.3 + 1;
            
            //self.star.position.z += 0.3;
            //if (self.star.position.z > 600){
            //    self.star.position.z = 0;
           // }

            /*
            if (self.active && distance > -30) {
                self.camera.position.z = 20 + ( 100 * (1 / (1 + Math.exp(-distance))))
                distance = distance - 0.09;
            }
            */

            self.postprocessing.composer.render(0.2);
            requestAnimationFrame(frame);
        }
        frame();            
    }

    activate() {
        this.active = true;
    }

}