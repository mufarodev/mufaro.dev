<script lang="ts">
    import { onMount } from 'svelte';
    
    interface Props {
        text: string;
        class?: string;
        scrambleSpeed?: number;
        triggerOnce?: boolean;
    }

    let { 
        text, 
        class: className = "", 
        scrambleSpeed = 30, 
        triggerOnce = true
    }: Props = $props();

    let mounted = $state(false);
    let displayText = $state(text);
    let hasAnimated = $state(false);
    let element: HTMLSpanElement;
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let interval: ReturnType<typeof setInterval>;
    let timeout: ReturnType<typeof setTimeout>;

    function scramble() {
        if (!mounted) return;
        
        // Reset to initial scrambled state
        displayText = text.split('').map((char) => {
            if (char === ' ') return ' ';
            return chars[Math.floor(Math.random() * chars.length)];
        }).join('');

        let iteration = 0;
        clearInterval(interval);
        
        interval = setInterval(() => {
            displayText = text
                .split('')
                .map((char, index) => {
                    if (index < iteration) {
                        return text[index];
                    }
                    if (char === ' ') return ' ';
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');
            
            if (iteration >= text.length) {
                clearInterval(interval);
            }
            
            iteration += 1 / 3;
        }, scrambleSpeed);
    }

    onMount(() => {
        mounted = true;
        displayText = text;
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && (!hasAnimated || !triggerOnce)) {
                        hasAnimated = true;
                        timeout = setTimeout(() => scramble(), 100);
                    }
                });
            },
            { rootMargin: '-10%', threshold: 0.1 }
        );
        
        if (element) observer.observe(element);
        
        return () => {
            observer.disconnect();
            clearInterval(interval);
            clearTimeout(timeout);
        };
    });
</script>

<span bind:this={element} class={className}>{displayText}</span>