<script lang="ts">
    import { onMount } from "svelte";
    import Title from "../../Title.svelte";
    import { connections } from "../../data.svelte";
    import { fly } from "svelte/transition";
    import OpenAI from "openai";
    import { formatDistanceToNow } from "date-fns";
    import EmphasizedCenterButton from "../../EmphasizedCenterButton.svelte";
    import { Calendar, TimeGrid, Interaction } from '@event-calendar/core';

    const API_KEY = "AIzaSyBnfBzGkZ0KgWXO7Pq7O4RhCNozHNk4dNM";

    type Assignment = {
        course: String;
        title: String;
        dueDate: Date;
        description: String;
    };

    let rawAssignments: Assignment[] = [
        {
            course: "CSE 331",
            title: "Concept Check 12",
            dueDate: new Date("2025-10-21"),
            description: "This is a quick concept check to assess your understanding of recent lecture content. You can expect it to take just a few minutes"
        },
        {
            course: "CSE 331",
            title: "At Home Worksheet 4",
            dueDate: new Date("2025-10-24"),
            description: "This is an at-home worksheet focusing on induction proofs. Complete the problems and submit your answers via Gradescope. There are 5 problems with multiple parts."
        },
        {
            course: "CSE 351",
            title: "Lab 2 - disassembling and defusing a binary bomb",
            dueDate: new Date("2025-10-27"),
            description: "This is your second lab assignment where you'll be disassembling a binary bomb using GDB and defusing it by providing correct inputs to each phase. There are five phases, one extra credit phase, and a secret phase. You can expect this to take several hours, so start early!"
        },
        {
            course: "CSE 390R",
            title: "Read a paper",
            dueDate: new Date("2025-10-20"),
            description: "Find a research paper related to your project topic, read it (you can skim), and then answer a few questions regarding it. Be prepared to talk about the paper in class."
        },
        {
            course: "EDUC 251",
            title: "Complete readings",
            dueDate: new Date("2025-10-22"),
            description: "Finish reading chapters 5 and 6 from 'Educational Psychology' and take notes on key concepts discussed in these chapters."
        }
    ];

    type PlanItem = {
        assignment: Assignment;
        hoursNeeded: number;
    }

    let planItems: PlanItem[] = $state([]); //$state([
    //     {
    //         assignment: rawAssignments[0],
    //         hoursNeeded: 0.5
    //     },
    //     {
    //         assignment: rawAssignments[1],
    //         hoursNeeded: 2
    //     },
    //     {
    //         assignment: rawAssignments[2],
    //         hoursNeeded: 5
    //     },
    //     {
    //         assignment: rawAssignments[3],
    //         hoursNeeded: 1
    //     },
    //     {
    //         assignment: rawAssignments[4],
    //         hoursNeeded: 1.5
    //     }
    // ]);
    let fakeNumberOfFetchedAssignments = $state(0);

    let sortedPlanItems: PlanItem[] = $derived.by(() => {
        return planItems.slice().sort((a, b) => a.assignment.dueDate.getTime() - b.assignment.dueDate.getTime());
    });

    let planFinalized = $state(false);
    // Cache and state for finalization
    let primaryCalendarId: string | null = null;
    let generatedWorkBlocks: any[] = [];
    let isFinalizing = $state(false);

    const readAssignments = async () => {
        let openai = new OpenAI({
            apiKey: "mcr-0Ri0vxCbvqK8FH6jDl",
            baseURL: "https://neuro.mancer.tech/oai/v1",
            dangerouslyAllowBrowser: true
        })
        const prompt = `You are an assistant that helps students plan their study schedules. Given a list of assignments with their course names, titles, due dates, and descriptions, estimate the number of hours a student would typically need to complete each assignment. After considering the complexity and workload, provide your estimate as a float prefixed by "HOURS_NEEDED:". Ensure the number is realistic and do not provide a ranged estimate. You should put your estimate at the end of your response. Here is one assignment:`;
        for (let assignment of rawAssignments) {
            let hoursMatch = null;
            while (!hoursMatch) {
                const response = await openai.chat.completions.create({
                    model: "lumi-8b-v2",
                    max_tokens: 1000,
                    messages: [
                        {
                            role: "system",
                            content: `${prompt}`
                        },
                        {
                            role: "user",
                            content: `Course: ${assignment.course}
    Title: ${assignment.title}
    Description: ${assignment.description}`
                        }
                    ]});
                console.log(response.choices[0].message.content);
                if (response.choices[0].message.content) {
                    hoursMatch = response.choices[0].message.content.match(/HOURS_NEEDED:\s*(\d+\.*\d*)/);
                    if (hoursMatch) {
                        const hoursNeeded = parseFloat(hoursMatch[1]);
                        planItems.push({
                            assignment,
                            hoursNeeded
                        });
                    }
                }
            }
        };
    };

    onMount(() => {
        if (!(connections.canvasConnected || connections.edstemConnected || connections.gradescopeConnected) || connections.gapiToken.length === 0) {
            location.hash = "#connect";
        }
        let interval = setInterval(() => {
            fakeNumberOfFetchedAssignments += Math.min(Math.floor(Math.random() * rawAssignments.length / 2), rawAssignments.length - fakeNumberOfFetchedAssignments);
            if (fakeNumberOfFetchedAssignments === rawAssignments.length) {
                clearInterval(interval);
                if (planItems.length === rawAssignments.length) return;
                readAssignments();
            }
        }, 400);
    });

    const getAssignmentWorkBlocks = (events: any[]) => {
        const now = new Date();
        const finalBlocks: any[] = [];

        console.log("Generating work blocks for assignments:", sortedPlanItems);
        
    // Define work hours (9 AM to 9 PM)
    const workStartHour = 9;
    const workEndHour = 21;
    const SLOT_MINUTES = 15; // scheduling granularity
        
        // Helper function to check if a time slot conflicts with existing events/blocks OR work hours
        const hasConflict = (start: Date, end: Date) => {
            // Enforce workday bounds on the same day
            const dayStart = new Date(start);
            dayStart.setHours(workStartHour, 0, 0, 0);
            const dayEnd = new Date(start);
            dayEnd.setHours(workEndHour, 0, 0, 0);

            // Must be same day and within work hours
            if (start.toDateString() !== end.toDateString()) return true;
            if (start < dayStart || end > dayEnd) return true;
            if (end <= start) return true;

            return [...events, ...finalBlocks].some(event => {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end);
                return (eventStart < end && eventEnd > start);
            });
        };
        
        // Helper function to find how many consecutive 15-min slots are available starting from a time
        const findAvailableSlots = (startTime: Date, maxSlots: number) => {
            let availableSlots = 0;
            let currentTime = new Date(startTime);

            // End of workday boundary for this day
            const dayEnd = new Date(startTime);
            dayEnd.setHours(workEndHour, 0, 0, 0);

            for (let i = 0; i < maxSlots; i++) {
                const nextSlot = new Date(currentTime);
                nextSlot.setMinutes(nextSlot.getMinutes() + SLOT_MINUTES);

                // Do not cross workday boundary
                if (nextSlot > dayEnd) break;

                if (hasConflict(currentTime, nextSlot)) break;

                availableSlots++;
                currentTime = nextSlot;
            }

            return availableSlots;
        };
        
        // Track remaining work (in 15-min slots) for each assignment
        const remainingSlots = new Map(
            sortedPlanItems.map(item => [
                item.assignment.title,
                Math.ceil((item.hoursNeeded * 60) / SLOT_MINUTES)
            ])
        );
        
        // Start searching from the next 15-min slot
        let currentSearchTime = new Date(now);
        currentSearchTime.setSeconds(0, 0);
        {
            const m = currentSearchTime.getMinutes();
            const add = (m % SLOT_MINUTES === 0) ? SLOT_MINUTES : (SLOT_MINUTES - (m % SLOT_MINUTES));
            currentSearchTime.setMinutes(m + add);
        }
        console.log("Starting search from (next 15-min slot):", currentSearchTime);
        
        // Keep trying to schedule until all assignments are done or we've searched far enough
        const maxDaysToSearch = 14;
        const searchEndTime = new Date(currentSearchTime);
        searchEndTime.setDate(searchEndTime.getDate() + maxDaysToSearch);
        
    while (currentSearchTime < searchEndTime && Array.from(remainingSlots.values()).some(s => s > 0)) {
            // Adjust to work hours if needed
            if (currentSearchTime.getHours() < workStartHour) {
                currentSearchTime.setHours(workStartHour, 0, 0, 0);
            } else if (currentSearchTime.getHours() >= workEndHour) {
                currentSearchTime.setDate(currentSearchTime.getDate() + 1);
                currentSearchTime.setHours(workStartHour, 0, 0, 0);
                continue;
            }
            
            // Check if this 15-min slot conflicts with existing events/blocks
            const nextSlot = new Date(currentSearchTime);
            nextSlot.setMinutes(nextSlot.getMinutes() + SLOT_MINUTES);
            
            if (hasConflict(currentSearchTime, nextSlot)) {
                currentSearchTime = nextSlot;
                continue;
            }
            
            // Try to find the best assignment to schedule at this time
            let bestAssignment = null;
            let bestSlotCount = 0;

            // Build candidate list with urgency and availability info
            const candidates: Array<{
                planItem: typeof sortedPlanItems[number],
                availableSlots: number,
                minSlots: number,
                slotsRemaining: number,
                dueInMs: number,
                urgent: boolean,
            }> = [];

            for (const planItem of sortedPlanItems) {
                const totalSlotsForAssignment = Math.ceil((planItem.hoursNeeded * 60) / SLOT_MINUTES);
                const slotsRemaining = remainingSlots.get(planItem.assignment.title) ?? totalSlotsForAssignment;
                if (slotsRemaining === 0) continue;

                const minSlots = Math.ceil(totalSlotsForAssignment / 3);
                const availableSlots = findAvailableSlots(currentSearchTime, slotsRemaining);
                if (availableSlots < minSlots) continue;

                const dueInMs = planItem.assignment.dueDate instanceof Date
                    ? (planItem.assignment.dueDate.getTime() - currentSearchTime.getTime())
                    : Number.POSITIVE_INFINITY;
                const urgent = dueInMs > 0 && dueInMs <= 24 * 60 * 60 * 1000; // within 24 hours

                candidates.push({ planItem, availableSlots, minSlots, slotsRemaining, dueInMs, urgent });
            }

            if (candidates.length > 0) {
                // Massive priority: if any urgent candidates exist, restrict to them
                const urgentCandidates = candidates.filter(c => c.urgent);
                const pool = urgentCandidates.length > 0 ? urgentCandidates : candidates;

                // Compute continuous urgency-weighted priority score
                const scored = pool.map(c => {
                    const dueHours = c.dueInMs === Number.POSITIVE_INFINITY ? Number.POSITIVE_INFINITY : (c.dueInMs / 3600000);
                    // Urgency grows as due date approaches; overdue treated as max urgency
                    const urgencyLinear = !isFinite(dueHours) ? 0 : (dueHours <= 0 ? 1 : Math.max(0, (24 - dueHours) / 24));
                    // Weight available contiguous time by urgency; up to 4x when due now/overdue
                    const priorityScore = c.availableSlots * (1 + urgencyLinear * 3);
                    return { ...c, priorityScore, dueHours };
                });

                scored.sort((a, b) => {
                    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
                    // tie-breaker: earlier due date
                    if (a.dueHours !== b.dueHours) return a.dueHours - b.dueHours;
                    // then most remaining work (in slots)
                    return b.slotsRemaining - a.slotsRemaining;
                });

                bestAssignment = scored[0].planItem;
                bestSlotCount = scored[0].availableSlots;

                const label = (pool === urgentCandidates) ? 'Urgent pool' : 'Normal pool';
                console.log(`${label}: chose ${bestAssignment.assignment.title} | score=${scored[0].priorityScore.toFixed(2)} | availSlots=${scored[0].availableSlots} | dueIn=${isFinite(scored[0].dueHours) ? scored[0].dueHours.toFixed(1)+'h' : 'n/a'}`);
            }
            
            // If we found a suitable assignment, schedule it
            if (bestAssignment && bestSlotCount > 0) {
                const blockStartTime = new Date(currentSearchTime);

                // Clamp to end of workday (in slots)
                const dayEnd = new Date(blockStartTime);
                dayEnd.setHours(workEndHour, 0, 0, 0);
                const maxSlotsUntilDayEnd = Math.max(0, Math.floor((dayEnd.getTime() - blockStartTime.getTime()) / (1000 * 60 * SLOT_MINUTES)));
                let blockSlots = Math.min(bestSlotCount, maxSlotsUntilDayEnd);
                if (blockSlots < bestSlotCount) {
                    console.log(`Clamped block for ${bestAssignment.assignment.title} from ${bestSlotCount} slots to ${blockSlots} slots (workday end)`);
                }

                // Enforce minimum block size (1/3 of total workload, in slots)
                const totalSlotsForAssignment = Math.ceil((bestAssignment.hoursNeeded * 60) / SLOT_MINUTES);
                const minSlots = Math.ceil(totalSlotsForAssignment / 3);
                if (blockSlots < minSlots) {
                    // Skip this slot; maybe another assignment fits
                    const nextSlotLocal = new Date(currentSearchTime);
                    nextSlotLocal.setMinutes(nextSlotLocal.getMinutes() + SLOT_MINUTES);
                    currentSearchTime = nextSlotLocal;
                    continue;
                }

                const blockEndTime = new Date(blockStartTime);
                blockEndTime.setMinutes(blockEndTime.getMinutes() + blockSlots * SLOT_MINUTES);

                const blockKey = blockKeyFrom(`Work on: ${bestAssignment.assignment.title}`, blockStartTime);
                finalBlocks.push({
                    id: blockKey,
                    title: `Work on: ${bestAssignment.assignment.title}`,
                    start: new Date(blockStartTime),
                    end: new Date(blockEndTime),
                    backgroundColor: '#3653c4',
                    editable: true,
                    extendedProps: { isWorkBlock: true, blockKey },
                });

                const prevRemainingSlots = remainingSlots.get(bestAssignment.assignment.title) ?? totalSlotsForAssignment;
                const newRemainingSlots = Math.max(0, prevRemainingSlots - blockSlots);
                remainingSlots.set(bestAssignment.assignment.title, newRemainingSlots);

                console.log(`Scheduled ${blockSlots * SLOT_MINUTES}min block for ${bestAssignment.assignment.title} at ${blockStartTime} to ${blockEndTime} (${newRemainingSlots} slots remaining)`);

                // Jump ahead by the block size
                currentSearchTime = blockEndTime;
            } else {
                // No suitable assignment for this slot, move to next hour
                // This slot might be useful for a different assignment later
                currentSearchTime = nextSlot;
            }
        }
        
        // Check if any assignments couldn't be fully scheduled (remaining slots)
        for (const [title, slots] of remainingSlots.entries()) {
            if (slots > 0) {
                const minutes = slots * SLOT_MINUTES;
                const hours = (minutes / 60).toFixed(2);
                console.warn(`Warning: Could not schedule ${slots} slots (~${hours}h) for ${title}`);
            }
        }
        
        console.log("Final scheduled blocks:", finalBlocks);
        return finalBlocks;
    };

    let calendarOptions = $state({
        view: 'timeGridWeek',
        height: "100%",
        headerToolbar: {start: 'title', center: '', end: ''},
        editable: false,
        eventDrop: (info: any) => {
            const evt = info?.event ?? info; // support different signatures
            const id = evt.id || evt?.extendedProps?.blockKey;
            if (!id) return;
            const start = new Date(evt.start);
            const end = new Date(evt.end);
            const idx = generatedWorkBlocks.findIndex(b => (b as any).id === id || (b as any).extendedProps?.blockKey === id || blockKeyFrom(b.title, b.start) === id);
            if (idx !== -1) {
                // Update local model
                (generatedWorkBlocks as any)[idx].start = start;
                (generatedWorkBlocks as any)[idx].end = end;
                console.log('Updated work block after drop:', id, start, end);
            }
        },
        eventResize: (info: any) => {
            const evt = info?.event ?? info;
            const id = evt.id || evt?.extendedProps?.blockKey;
            if (!id) return;
            const start = new Date(evt.start);
            const end = new Date(evt.end);
            const idx = generatedWorkBlocks.findIndex(b => (b as any).id === id || (b as any).extendedProps?.blockKey === id || blockKeyFrom(b.title, b.start) === id);
            if (idx !== -1) {
                (generatedWorkBlocks as any)[idx].start = start;
                (generatedWorkBlocks as any)[idx].end = end;
                console.log('Updated work block after resize:', id, start, end);
            }
        },
        eventSources: [{
            events: async (fetchInfo: {start: Date, end: Date, startStr: string, endStr: string}, successCallback: (events: any[]) => void, failureCallback: (error: any) => void) =>{
                try {
                    let calendars = await fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList?key=${API_KEY}`, {
                        headers: {
                            Authorization: `Bearer ${connections.gapiToken}`
                        }
                    });
                    let calendarData = await calendars.json();
                    let primaryCalendar = calendarData.items.find((cal: any) => cal.primary);
                    if (primaryCalendar && !primaryCalendarId) primaryCalendarId = primaryCalendar.id;
                    let eventsResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${primaryCalendar.id}/events?timeMin=${fetchInfo.start.toISOString()}&timeMax=${fetchInfo.end.toISOString()}&singleEvents=true&orderBy=startTime&key=${API_KEY}`, {
                        headers: {
                            Authorization: `Bearer ${connections.gapiToken}`
                        }
                    });
                    let eventsData = await eventsResponse.json();
                    let events = eventsData.items.map((event: any) => {
                        const startRaw = event.start.dateTime || event.start.date;
                        const endRaw = event.end.dateTime || event.end.date;
                        // Normalize to Date objects for consistent handling
                        const start = new Date(startRaw);
                        const end = new Date(endRaw);
                        return {
                            title: event.summary,
                            start,
                            end,
                            editable: false,
                            startEditable: false,
                            durationEditable: false,
                            backgroundColor: '#444',
                        };
                    });
                    
                    // Generate assignment work blocks
                    const workBlocks = getAssignmentWorkBlocks(events);
                    generatedWorkBlocks = workBlocks;
                    
                    // Combine calendar events with work blocks
                    successCallback([...events, ...workBlocks]);
                } catch (error) {
                    failureCallback(error); 
                }
            }
        }],
        loading: (isLoading: boolean) => {
            console.log("Calendar loading:", isLoading);
        },
        events: []
    });

    // Ensure we have the user's primary calendar id
    const ensurePrimaryCalendarId = async (): Promise<string> => {
        if (primaryCalendarId) return primaryCalendarId;
        const resp = await fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList?key=${API_KEY}`, {
            headers: {
                Authorization: `Bearer ${connections.gapiToken}`
            }
        });
        const data = await resp.json();
        const primary = data.items?.find((cal: any) => cal.primary);
        if (!primary) throw new Error('Primary calendar not found');
        primaryCalendarId = primary.id;
        return primaryCalendarId!;
    };

    const blockKeyFrom = (title: string, start: Date) => {
        const ts = Math.floor(start.getTime() / 1000);
        const slug = title.toLowerCase().replace(/[^a-z0-9-_]+/g, '-').slice(0, 64).replace(/^-+|-+$/g, '') || 'block';
        return `wao-${ts}-${slug}`.slice(0, 128);
    };

    const finalizePlan = async () => {
        if (isFinalizing) return;
        try {
            isFinalizing = true;
            const calId = await ensurePrimaryCalendarId();
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

            for (const block of generatedWorkBlocks) {
                const start = (block.start instanceof Date) ? block.start : new Date(block.start);
                const end = (block.end instanceof Date) ? block.end : new Date(block.end);
                const blockKey = (block as any)?.extendedProps?.blockKey || (block as any)?.id || blockKeyFrom(block.title, start);

                // Skip if an event with this blockKey already exists
                const checkUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?privateExtendedProperty=${encodeURIComponent('blockKey=' + blockKey)}&maxResults=1&key=${API_KEY}`;
                const existsResp = await fetch(checkUrl, {
                    headers: { Authorization: `Bearer ${connections.gapiToken}` }
                });
                if (existsResp.ok) {
                    const existsJson = await existsResp.json();
                    if (Array.isArray(existsJson.items) && existsJson.items.length > 0) {
                        console.log('Event already exists by blockKey (skipping):', blockKey);
                        continue;
                    }
                }
                const body = {
                    summary: block.title,
                    start: { dateTime: start.toISOString(), timeZone: tz },
                    end: { dateTime: end.toISOString(), timeZone: tz },
                    description: 'Planned by WorkAtOnce',
                    extendedProperties: { private: { source: 'workatonce', blockKey } },
                };

                const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?key=${API_KEY}`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${connections.gapiToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });

                if (!res.ok) {
                    if (res.status !== 409) {
                        const txt = await res.text();
                        console.error('Failed to insert event', blockKey, res.status, txt);
                    } else {
                        console.log('Event already exists (skipping):', blockKey);
                    }
                } else {
                    console.log('Inserted event:', blockKey, start, end);
                }
            }

            location.hash = '#done';
        } catch (e) {
            console.error('Finalize plan failed:', e);
            alert('Failed to finalize plan. Please try again.');
        } finally {
            isFinalizing = false;
        }
    };

    // $effect(() => {
    //     if (planFinalized) {
    //         const calendar = new Calendar({
    //             target: document.querySelector('.calendar') as HTMLElement,
    //             props: {
    //                 plugins: [TimeGrid],
    //                 initialView: 'timeGridWeek',
    //                 events: planItems.map(item => ({
    //                     title: `${item.assignment.course}: ${item.assignment.title}`,
    //                     start: new Date(item.assignment.dueDate.getTime() - item.hoursNeeded * 60 * 60 * 1000),
    //                     end: item.assignment.dueDate
    //                 }))
    //             }
    //         });
    //     }
    // }); 

</script>

<div class="plan-page-container">
    <header>
        <Title></Title>
    </header>
    <div class="content" in:fly|global={{ y: 20, duration: 400, delay: 400 }}>
        {#if rawAssignments.length === 0 || fakeNumberOfFetchedAssignments < rawAssignments.length}
            <div class="centered">
                <h1>fetching your assignments... <br>({fakeNumberOfFetchedAssignments} fetched)</h1>
            </div>
        {:else if planItems.length !== rawAssignments.length}
            <div class="centered">
                <h1>reading your assignments... <br>({planItems.length}/{rawAssignments.length})</h1>
            </div>
        {:else if planFinalized === false}
            <div in:fly={{ x: -20, duration: 400 }} class="assignment-grouping">
                <div class="assignment-overview">
                    <div class="assignment-overview-header">this week's to-dos</div>
                    <div class="assignments-list">
                        {#each sortedPlanItems as { assignment, hoursNeeded }, index}
                            <div class="assignment">
                                <div class="assignment-details">{assignment.course} - {assignment.title.toLowerCase()}, due in {formatDistanceToNow(assignment.dueDate)}</div>
                                <div class="assignment-hours">
                                    <input type="number" bind:value={sortedPlanItems[index].hoursNeeded} min="0" step="0.1">
                                    hours
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
                <EmphasizedCenterButton text="looks good" onclick={() => planFinalized = true}></EmphasizedCenterButton>
            </div>
        {:else}
            <div in:fly={{ x: 20, duration: 400, delay: 400 }} out:fly={{ x: 20, duration: 400 }} class="calendar-container">
                <Calendar plugins={[TimeGrid, Interaction]} options={calendarOptions}></Calendar>
                <EmphasizedCenterButton text={isFinalizing ? 'finalizing…' : 'finalize plan'} onclick={finalizePlan}></EmphasizedCenterButton>
            </div>
        {/if}
    </div>
</div>

<style>
    .plan-page-container {
        position: absolute;
        width: 100%;
        height: 100%;
        padding: 5em;
        padding-top: 3em;
        box-sizing: border-box;
        text-align: left;
    }

    header {
        width: 100%;
    }

    .content {
        width: 100%;
        height: calc(100% - 8em);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .centered {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        text-align: center;
    }

    .assignment-overview {
        width: 100%;
        margin-top: 2em;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: 1em;
        overflow-y: auto;
    }

    .assignment-grouping {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .assignment-overview-header {
        font-size: 40px;
        margin-bottom: 0.2em;
    }

    .assignments-list {
        width: 100%;
        max-height: 100%;
        overflow-y: auto;
        font-size: 20px;
        display: flex;
        flex-direction: column;
        gap: 1em;
    }

    .assignment {
        padding: 0.7em;
        border: 2px solid black;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
    }

    input {
        width: 2em;
        font-size: 18px;
        padding: 0.2em;
        margin-right: 0.5em;
        appearance: textfield;
    }

    input:focus {
        outline: none;
        border: 2px solid #4D90FE;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    :global(.ec) {
        margin-top: 5em;
        margin-bottom: 2em;
        width: 100%;
    }

    .calendar-container {
        margin-top: 2em;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1em;
    }
</style>