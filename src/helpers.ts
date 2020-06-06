import { TournamentData } from "brackets-model/dist/types";
import * as fs from 'fs';

const viewerRoot = 'https://cdn.jsdelivr.net/gh/Drarig29/brackets-viewer.js/dist';

export function makeViewer(data: TournamentData) {
    const html = `<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.slim.min.js"></script>

<link rel="stylesheet" href="${viewerRoot}/brackets-viewer.min.css" />
<script type="text/javascript" src="${viewerRoot}/brackets-viewer.min.js"></script>

<section class="tournament"></section>
<script>
    bracketsViewer.render(${JSON.stringify(data, null, 4)});
</script>`;

    fs.writeFileSync('viewer/viewer.html', html);
}

/**
 * Toornament's method to distribute seeds in the first round of single or double elimination.
 */
export function innerOuterMethod(array: number[]): number[][] {
    const size = array.length / 4;
    const parts = {
        inner: [array.slice(size, 2 * size), array.slice(2 * size, 3 * size)],
        outer: [array.slice(0, size), array.slice(3 * size, 4 * size)]
    }

    function inner(part: number[][]): number[] {
        return [part[0].pop()!, part[1].shift()!];
    }

    function outer(part: number[][]): number[] {
        return [part[0].shift()!, part[1].pop()!];
    }

    const result: number[][] = [];

    for (let i = 0; i < size / 2; i++) {
        result.push(
            outer(parts.outer), // Outer's outer
            inner(parts.inner), // Inner's inner
            inner(parts.outer), // Outer's inner
            outer(parts.inner), // Inner's outer
        );
    }

    return result;
}