set OUTPUT_FILE=WME_Adds.user.js

type WME_Adds.header.user.js > %OUTPUT_FILE%

echo //  >> %OUTPUT_FILE%
echo // CLASS DEFINITIONS FILE  >> %OUTPUT_FILE%
echo //  >> %OUTPUT_FILE%
type WME_Adds.classdefn.user.js >> %OUTPUT_FILE%

echo //  >> %OUTPUT_FILE%
echo // UTILITY DEFINITIONS FILE  >> %OUTPUT_FILE%
echo //  >> %OUTPUT_FILE%
type WME_Adds.util.user.js >> %OUTPUT_FILE%

echo //  >> %OUTPUT_FILE%
echo // COMPONENT SELECTION CLASS  >> %OUTPUT_FILE%
echo //  >> %OUTPUT_FILE%
type WME_Adds.componentselect.user.js >> %OUTPUT_FILE%

echo //  >> %OUTPUT_FILE%
echo // USER SELECTIONS DEFINITIONS FILE  >> %OUTPUT_FILE%
echo //  >> %OUTPUT_FILE%
type WME_Adds.selections.user.js >> %OUTPUT_FILE%

echo //  >> %OUTPUT_FILE%
echo // CORE FILE  >> %OUTPUT_FILE%
echo //  >> %OUTPUT_FILE%
type WME_Adds.core.user.js >> %OUTPUT_FILE%
