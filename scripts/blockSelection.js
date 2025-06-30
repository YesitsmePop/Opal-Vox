import { blocks } from "./blocks.js";
import { player } from "./main.js";

export function createBlockSelectionUI() {
    const blockSelectionContainer = document.getElementById('block-selection-container');

    blockSelectionContainer.innerHTML = '';

    const blockOptions = Object.entries(blocks).map(([blockId, block]) => {
        const blockOption = document.createElement('img');
        blockOption.src = block.texture;
        blockOption.className = 'block-option';
        blockOption.dataset.blockId = blockId;
        blockOption.addEventListener('click', () => selectBlock(blockId));
        return blockOption;
    });

    const itemTag = document.getElementById('itemtag-selector');

    blockOptions.forEach(option => {
        option.addEventListener('mouseover', () => {
            const blockId = option.dataset.blockId;
            const itemName = blocks[blockId].name;

            itemTag.textContent = itemName;
            itemTag.style.display = 'block';
        });

        option.addEventListener('mouseout', () => {
            itemTag.style.display = 'none';
        });
    });

    blockSelectionContainer.append(...blockOptions);

    const maxRows = 100;
    const numBlocksPerRow = 5;

    for (let i = 0; i < maxRows; i++) {
        const row = document.createElement('div');
        row.className = 'block-row';

        for (let j = 0; j < numBlocksPerRow; j++) {
            const index = i * numBlocksPerRow + j;
            if (index < blockOptions.length) {
                row.appendChild(blockOptions[index]);
            }
        }

        blockSelectionContainer.appendChild(row);
    }

    blockSelectionContainer.style.height = `${blockOptions.length / numBlocksPerRow * 40}px`; // Adjust the height based on the size of each block option
    blockSelectionContainer.style.overflowY = 'scroll';

}

function selectBlock(blockId) {
    const selectedBlock = blocks[blockId];
    player.setSelectedBlock(selectedBlock);
    const toolbarIcon = document.getElementById('toolbar-2');

    toolbarIcon.src = selectedBlock.texture;
}