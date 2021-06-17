import React, { useReducer } from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import $ from '../sefaria/sefariaJquery';
import AboutBox from '../AboutBox';

const getCurrObjectVersions = async (ref, masterPanelLanguage) => {
    const data = await Sefaria.getText(ref, {context: 1});
    return {
        en: Sefaria.getVersionFromData(data, "en", masterPanelLanguage),
        he: Sefaria.getVersionFromData(data, "he", masterPanelLanguage),
    }
}
it('renders', async () => {
    const title = {en: "Job", he: "איוב"};
    const sectionRef = `${title.en} 1`;
    const currObjectVersions = await getCurrObjectVersions(sectionRef, "bilingual");
    render(
        <AboutBox
            currObjectVersions={currObjectVersions}
            masterPanelLanguage={"english"}
            title={title.en}
            srefs={[`${title.en} 1:1`]}
            sectionRef={sectionRef}
        />
    );
    await waitFor(() => screen.getByText("About This Text"));
});