<script lang="ts">
    import { strings } from '$lib/strings.svelte';
    import { useEventListener, Debounced } from 'runed';
    import { cn } from '$lib/utils';

    const letterStyles = {
        normal: '',
        dashed: 'text-transparent bg-position-[0_0] bg-size-[0.8rem_0.8rem] bg-clip-text bg-repeat bg-[linear-gradient(-45deg,#0000,#0000_20.58050117%,#fff_0,#fff_29.41949883%,#0000_0,#0000_70.58050117%,#fff_0,#fff_79.41949883%,#0000_0,#0000)]'
    } as const;

    let pickedStyle: { [letter: string]: keyof typeof letterStyles } = $state(
        Object.fromEntries(strings.username.split('').map((letter) => [letter, 'normal' as const]))
    );
    const debounced = new Debounced(() => pickedStyle, 2000);

    const changeLetterStyle = (letter: string) => {
        const styles = Object.keys(letterStyles) as (keyof typeof letterStyles)[];
        const currentStyle = pickedStyle[letter];
        if (currentStyle !== "normal") return;

        const currentIndex = styles.indexOf(currentStyle);
        const nextIndex = (currentIndex + 1) % styles.length;
        pickedStyle[letter] = styles[nextIndex];

        setTimeout(() => {
            pickedStyle[letter] = 'normal';
        }, 750);
    };

    let usernameContainer: HTMLElement | null = null;
</script>

<div class="inline-flex items-center gap-2">
    <div bind:this={usernameContainer} class="relative text-6xl font-bold">
            {#each strings.username.split('') as letter, index}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <span
                    onmouseover={() => changeLetterStyle(letter)}
                    onfocus={() => {}}
                    class={cn('inline-block ', letterStyles[debounced.current[letter]])}>{letter}</span
                >
            {/each}
    </div>
</div>