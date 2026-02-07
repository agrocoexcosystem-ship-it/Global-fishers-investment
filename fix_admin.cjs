const fs = require('fs');
const path = 'pages/Admin.tsx';

try {
    let content = fs.readFileSync(path, 'utf8');

    // Find the AnimatePresence closing tag which is near the end
    const anchor = '</AnimatePresence>';
    const anchorIndex = content.lastIndexOf(anchor);

    if (anchorIndex === -1) {
        console.error('Could not find anchor');
        process.exit(1);
    }

    const correctFooter = `                    </AnimatePresence>
                    </main>
                </>
            )}
        </div>
    );
};

export default Admin;
`;

    // Determine where to cut. We want to keep everything up to the anchor start, 
    // but wait, the anchor is part of the footer block I want to fix? 
    // No, AnimatePresence is fine. It's what comes AFTER.
    // The broken part starts AFTER </AnimatePresence>
    // Actually, the broken part is:
    //                 </main>
    //         </>
    //     )
    // }
    //         </div >
    //     );
    // };

    // So we keep up to anchorIndex + anchor.length
    // And append the rest of the correct footer structure (closing main, fragment, etc)

    // But wait, the correct footer I drafted above includes `</AnimatePresence>` to be safe.
    // let's cut at `anchorIndex` to replace `</AnimatePresence>` and everything after.

    const newContent = content.substring(0, anchorIndex) + correctFooter;

    fs.writeFileSync(path, newContent, 'utf8');
    console.log('Fixed Admin.tsx');

} catch (e) {
    console.error(e);
    process.exit(1);
}
