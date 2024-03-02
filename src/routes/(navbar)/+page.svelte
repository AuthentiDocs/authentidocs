<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { logged_in_store } from "$lib/stores";
    import * as THREE from 'three';
    import { fade } from "svelte/transition";

    let chars: HTMLParagraphElement[] = new Array("authentidocs".length);
    let canvas_root: HTMLDivElement;

    onMount(async (): Promise<void> =>
    {
        if($page.data.session)
        {
            logged_in_store.set(true);
            goto("/home");
        }

        const renderer = new THREE.WebGLRenderer();
        renderer.domElement.style.position = "absolute";
        renderer.domElement.style.top = "0";
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";

        canvas_root.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, renderer.domElement.clientWidth / renderer.domElement.clientHeight, 0.1, 1000.0);
        const geometry = new THREE.BoxGeometry(1, 1.5, 1);
        const material = new THREE.MeshBasicMaterial({color: 0x2563eb});
        const cube = new THREE.Mesh(geometry, material);

        cube.translateX(-1.5);
        cube.translateY(0.25);
        scene.add(cube);

        camera.position.z = 5;
        let count: number = 0;

        function animate() {
            requestAnimationFrame( animate );

            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            cube.position.y = 0.1 * Math.sin(count);
            count += 0.01;

            renderer.render(scene, camera);
        }

        animate();

        renderer.render(scene, camera);
        renderer.setClearAlpha(0.0);
        renderer.clearColor();

        chars[0].animate(
        [
            {
                translate: "0 100%",
                easing: "ease-out"
            },
            {
                translate: "0 0"
            }
        ], 250);
        chars[1].animate(
        [
            {
                translate: "-100% 0",
            },
            {
                translate: "-100% 0",
                offset: 0.5,
                easing: "ease-out"
            },
            {
                translate: "0 0"
            }
        ], 500);
        chars[2].animate(
        [
            {
                opacity: "0",
                easing: "ease-in"
            },
            {
                opacity: "100%"
            }
        ], 250);
        chars[3].animate(
        [
            {
                translate: "0 -100%",
                easing: "ease-out"
            },
            {
                translate: "0 10%",
                easing: "ease-in",
                offset: 0.7
            },
            {
                translate: "0 0"
            }
        ], 250);
        chars[5].animate(
        [
            {
                translate: "100% 0"
            },
            {
                translate: "100% 0",
                offset: 0.5,
                easing: "ease-out"
            },
            {
                translate: "0 0"
            },
        ], 300);
        chars[6].animate(
        [
            {
                scale: "30% 30%",
                easing: "ease-in"
            },
            {
                scale: "70% 70%",
                offset: 0.3
            },
            {
                scale: "70% 70%",
                offset: 0.7,
                easing: "ease-out"
            },
            {
                scale: "100% 100%"
            },
        ], 300);
        chars[7].animate(
        [
            {
                translate: "0 -100%",
                easing: "ease-out"
            },
            {
                translate: "0 0"
            }
        ], 250);
        chars[8].animate(
        [
            {
                translate: "-10% -10%",
                opacity: "0%"
            },
            {
                translate: "-10% -10%",
                opacity: "0%",
                easing: "ease-in",
                offset: 0.2
            },
            {
                translate: "-10% -10%",
                opacity: "100%",
                easing: "ease-out",
                offset: 0.5
            },
            {
                translate: "0 -10%",
                easing: "ease-out",
                offset: 0.75
            },
            {
                translate: "0 0",
            }
        ], 500);
        chars[9].animate(
        [
            {
                translate: "-10% 10%",
                opacity: "0%"
            },
            {
                translate: "-10% 10%",
                opacity: "0%",
                easing: "ease-in",
                offset: 0.2
            },
            {
                translate: "-10% 10%",
                opacity: "100%",
                easing: "ease-out",
                offset: 0.5
            },
            {
                translate: "-10% 0",
                easing: "ease-out",
                offset: 0.75
            },
            {
                translate: "0 0",
            }
        ], 500);
        chars[10].animate(
        [
            {
                translate: "10% -10%",
                opacity: "0%"
            },
            {
                translate: "10% -10%",
                opacity: "0%",
                easing: "ease-in",
                offset: 0.2
            },
            {
                translate: "10% -10%",
                opacity: "100%",
                easing: "ease-out",
                offset: 0.5
            },
            {
                translate: "0 -10%",
                easing: "ease-out",
                offset: 0.75
            },
            {
                translate: "0 0",
            }
        ], 500);
        chars[11].animate(
        [
            {
                translate: "10% 10%",
                opacity: "0%"
            },
            {
                translate: "10% 10%",
                opacity: "0%",
                easing: "ease-in",
                offset: 0.2
            },
            {
                translate: "10% 10%",
                opacity: "100%",
                easing: "ease-out",
                offset: 0.5
            },
            {
                translate: "10% 0",
                easing: "ease-out",
                offset: 0.75
            },
            {
                translate: "0 0",
            }
        ], 500);
        renderer.domElement.animate(
        [
            {
                opacity: 0
            },
            {
                opacity: 0,
                easing: "ease-in",
                offset: 0.5
            },
            {
                opacity: 1
            }
        ], 1200);
    });
</script>

<div class="home-root">
    <div bind:this={canvas_root} class="canvas-3d">

    </div>
    <div class="flex">
        <div class="">
            <p bind:this={chars[0]} class="title text-semibold text-gray-700">A</p>
        </div>
        <div class="char-carrier">
            <p bind:this={chars[1]} class="title text-semibold text-gray-700">U</p>
        </div>
        <div class="char-carrier">
            <p bind:this={chars[2]} class="title text-semibold text-gray-700">T</p>
        </div>
        <div class="char-carrier">
            <p bind:this={chars[3]} class="title text-semibold text-gray-700">H</p>
        </div>
        <div class="char-carrier">
            <p bind:this={chars[4]} class="title text-semibold text-gray-700">E</p>
        </div>
        <div class="char-carrier">
            <p bind:this={chars[5]} class="title text-semibold text-gray-700">N</p>
        </div>
        <div class="char-carrier">
            <p bind:this={chars[6]} class="title text-semibold text-gray-700">T</p>
        </div>
        <div>
            <p bind:this={chars[7]} class="title text-semibold text-gray-700">I</p>
        </div>
        <div>
            <p bind:this={chars[8]} class="title text-semibold text-gray-700">D</p>
        </div>
        <div>
            <p bind:this={chars[9]} class="title text-semibold text-blue-600">O</p>
        </div>
        <div>
            <p bind:this={chars[10]} class="title text-semibold text-gray-700">C</p>
        </div>
        <div>
            <p bind:this={chars[11]} class="title text-semibold text-gray-700">S</p>
        </div>
    </div>
</div>

<style>
    .home-root
    {
        position: absolute;
        top: 5.25rem;
        bottom: 1rem;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .canvas-3d
    {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: -1;
        filter: blur(100px);
    }
    .char-carrier
    {
        overflow: hidden;
    }
    .title
    {
        font-size: 12em;
        line-height: 1em;
    }
    @media(max-width: 1500px)
    {
        .title
        {
            font-size: 10em;
            line-height: 0.8em;
        }
    }
    @media(max-width: 1400px)
    {
        .title
        {
            font-size: 8em;
            line-height: 0.8em;
        }
    }
</style>