import { useFormState } from '@green-stack/forms/useFormState';
import { useScrollToFocusedInput } from '@green-stack/hooks/useScrollToFocusedInput';
import { useRouteParams, useRouter } from '@green-stack/navigation';
import { removeSetItem } from '@green-stack/utils/arrayUtils';
import { isEmpty } from '@green-stack/utils/commonUtils';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect, useRef, useState } from 'react';
import { isWeb } from '../appConfig';
import BackButton from '../components/BackButton';
import { Button } from '../components/Button';
import { EfficiencyResults } from '../components/EfficiencyResults';
import {
  getThemeColor,
  H1,
  H2,
  H3,
  KeyboardAvoidingView,
  Link,
  ScrollView,
  Text,
  View,
} from '../components/styled';
import { Checkbox } from '../forms/Checkbox.styled';
import { CheckList } from '../forms/CheckList.styled';
import { NumberStepper } from '../forms/NumberStepper.styled';
import { RadioGroup } from '../forms/RadioGroup.styled';
import { Select } from '../forms/Select.styled';
import { Switch } from '../forms/Switch.styled';
import { TextArea } from '../forms/TextArea.styled';
import { TextInput } from '../forms/TextInput.styled';
import { calculateEfficiency } from '../utils/calculateEfficiency';
import { FEATURES, FormScreenProps, IDENTITIES } from './FormsScreen.types';

/* --- Disclaimer ------------------------------------------------------------------------------ */

// -i- This demo screen serves multiple purposes -i-

// -1- For how we calculated the efficiency gains with this kit -> See 'utils/calculateEfficiency.ts'
// -2- For a sense of how to use the form components and hooks -> See the rest of this file

// -i- Feel free to delete this and other example screens manually
// -i- or through a merge of the 'with/clean-slate' branch (paid version only)

/* --- Components ------------------------------------------------------------------------------ */

const CustomRadioGroup = RadioGroup.create<FormScreenProps['identifiesWith']>();

/* --- <FormsScreen/> ------------------------------------------------------------------------- */

export const FormsScreen = (props: FormScreenProps) => {
  // Nav
  const { setParams } = useRouter();
  const params = useRouteParams(props);

  // Refs
  const emailInputRef = useRef<any$Ignore>(null);
  const ageInputRef = useRef<any$Ignore>(null);
  const feedbackInputRef = useRef<any$Ignore>(null);

  // Hooks
  const inputScrollUtils = useScrollToFocusedInput();

  // State
  const [validateOnChange, setValidateOnChange] = useState(
    !!params.validateOnChange
  );

  // Forms
  const formState = useFormState(FormScreenProps, {
    initialValues: { ...props, ...params },
    validateOnChange,
  });

  // Vars
  const { showFormState, showResults, showBenefits, identifiesWith } =
    formState.values;
  const { excitingFeatures, platformsTargeted = 1 } = formState.values;
  const { currentSetupHoursPerProject, knownTech } = formState.values;

  // Theme
  const scheme = useColorScheme();

  // -- Calculations --

  const results = calculateEfficiency(formState.values);
  const { shipsWebOnly, shipsMobileOnly } = results;
  const { annualAvgEfficiencyBoost, annualHoursSaved } = results;
  const { deliveryEfficiency, finalEfficiencyRate } = results;
  const { learningGapHours, setupHoursPerProject } = results;

  // -- Handlers --

  const submitForm = () => {
    formState.handleChange('showResults', !showResults);
  };

  // -- Effects --

  useEffect(() => {
    if (!(validateOnChange || isEmpty(formState.errors))) {
      formState.updateErrors({});
    }
  }, [validateOnChange, formState.errors, formState.updateErrors]);

  // ⬇ Update url params when form values change

  useEffect(() => {
    if (!formState.isDefaultState) {
      setParams(formState.values);
    }
  }, [formState.values, formState.isDefaultState, setParams]);

  // ⬇ Update projectsPerYear based on identifiesWith

  useEffect(() => {
    switch (identifiesWith) {
      case 'full-product-dev':
        formState.handleChange('projectsPerYear', 3);
        break;
      case 'freelance-app-dev':
        formState.handleChange('projectsPerYear', 4);
        break;
      case 'startup-founder':
        formState.handleChange('projectsPerYear', 1);
        break;
      case 'indiehacker':
        formState.handleChange('projectsPerYear', 5);
        break;
      case 'studio-lead':
        formState.handleChange('projectsPerYear', 7);
        break;
    }
  }, [identifiesWith, formState.handleChange]);

  // ⬇ Update prefill of knownTech based on platformsTargeted

  useEffect(() => {
    let updatedKnownTech = knownTech;

    if (shipsWebOnly) {
      updatedKnownTech = removeSetItem(updatedKnownTech, 'react-native');
      updatedKnownTech = removeSetItem(updatedKnownTech, 'expo');
    }

    if (shipsMobileOnly) {
      updatedKnownTech = removeSetItem(updatedKnownTech, 'nextjs');
    }

    formState.handleChange('knownTech', updatedKnownTech);
  }, [formState.handleChange, knownTech, shipsMobileOnly, shipsWebOnly]);

  // -- Render --

  return (
    <KeyboardAvoidingView {...inputScrollUtils.avoidingViewProps}>
      <StatusBar style={scheme.colorScheme === 'light' ? 'dark' : 'light'} />
      <ScrollView
        {...inputScrollUtils.scrollViewProps}
        className="flex min-h-screen flex-1 bg-background"
        contentContainerClassName="min-h-screen"
      >
        <View className="flex flex-1 items-center justify-center pt-28 pb-16">
          <View className="flex w-full max-w-[500px] flex-col px-8">
            <H1
              onPress={() =>
                scheme.setColorScheme(
                  scheme.colorScheme !== 'dark' ? 'dark' : 'light'
                )
              }
            >
              {'Universal Forms Demo'}
            </H1>

            <View className="h-4" />

            {/* -- TextInput -- */}

            <TextInput
              placeholder="e.g. thorr@fullproduct.dev"
              {...formState.getTextInputProps('email')}
              {...inputScrollUtils.registerInput(emailInputRef)}
            />

            <Text className="mt-2 text-secondary text-sm">Your email</Text>

            <View className="h-4" />

            {/* -- Stepper -- */}

            <NumberStepper
              max={150}
              min={18}
              placeholder="e.g. 32"
              step={1}
              {...formState.getInputProps('age')}
              {...inputScrollUtils.registerInput(ageInputRef)}
            />

            <Text className="mt-2 text-secondary text-sm">Your age</Text>

            <View className="h-6" />

            {/* -- Checkbox -- */}

            <Checkbox
              checked={validateOnChange}
              label="Validate on change?"
              onCheckedChange={setValidateOnChange}
            />

            <View className="my-6 h-1 w-12 bg-slate-300" />

            {/* -- Radiogroup -- */}

            <H2 className="text-primary">What role describes you best?</H2>

            <View className="h-4" />

            <CustomRadioGroup
              options={{
                'full-product-dev': IDENTITIES.entries['full-product-dev'],
                'freelance-app-dev': IDENTITIES.entries['freelance-app-dev'],
              }}
              {...formState.getInputProps('identifiesWith')}
            >
              <RadioGroup.Option
                label="Startup Founder"
                value="startup-founder"
              />
              <RadioGroup.Option
                label="Indie Hacker / Solo App Dev"
                value="indiehacker"
              />
              <RadioGroup.Option
                label="Studio Lead / CEO / Architect"
                value="studio-lead"
              />
            </CustomRadioGroup>

            <View className="my-6 h-1 w-12 bg-slate-300" />

            {/* -- Select -- */}

            <H2 className="text-primary">
              What platforms do you typically ship?
            </H2>

            <View className="h-4" />

            <Select
              onChange={(targets) => {
                if (targets) {
                  formState.handleChange('platformsTargeted', +targets); // @ts-ignore
                } else {
                  formState.handleChange('platformsTargeted', undefined);
                }
              }}
              options={{ '1': 'Web only 👉 Static / SSR + Hydration' }}
              placeholder="Select devices and targets"
              value={`${formState.values.platformsTargeted || ''}`}
            >
              <Select.Option label="Mobile 📲 iOS + Android" value="2" />
              <Select.Option label="Universal 🚀 Web + Mobile" value="3" />
            </Select>

            <View className="my-6 h-1 w-12 bg-slate-300" />

            {/* -- CheckList -- */}

            <H2 className="text-primary">Which DX features excite you?</H2>

            <View className="h-4" />

            <CheckList
              options={FEATURES.entries}
              {...formState.getInputProps('excitingFeatures')}
            />

            <View className="my-6 h-1 w-12 bg-slate-300" />

            {/* -- Plugin Branches -- */}

            {/* {excitingFeatures.includes('git-plugins') && (
                            <>
                                <H2 className="text-primary">
                                    What plugins would you merge?
                                </H2>

                                <View className="h-4" />
                                
                                <CheckList
                                    options={PLUGINS.entries}
                                    {...formState.getInputProps('pluginsToMerge')}
                                />

                                <View className="h-1 w-12 my-6 bg-slate-300" />
                            </>
                        )} */}

            {/* -- TextArea -- */}

            <H2 className="text-primary">What's missing?</H2>

            <View className="h-4" />

            <TextArea
              maxLength={500}
              numberOfLines={5}
              placeholder="How could we further improve your workflow?"
              {...formState.getTextInputProps('feedbackSuggestions')}
              {...inputScrollUtils.registerInput(feedbackInputRef)}
            />

            <Text className="mt-2 text-secondary text-sm">
              Feedback or suggestions appreciated
            </Text>

            <View className="my-6 h-1 w-12 bg-slate-300" />

            {/* -- Results -- */}

            {showResults && (
              <EfficiencyResults
                // @ts-expect-error
                formState={formState}
                showBenefits={showBenefits}
              />
            )}

            <View className="h-8" />

            {/* -- Button -- */}

            <View className="flex-row">
              <Button
                disabled={!formState.isValid}
                fullWidth
                iconRight={showResults ? 'ChevronUpFilled' : 'ArrowRightFilled'}
                onPress={submitForm}
                size="md"
                text={showResults ? 'Hide Results' : 'Submit & Show Results'}
                type={showResults ? 'outline' : 'primary'}
              />
            </View>

            {/* -- Switch -- */}

            <View className="my-6 h-1 w-12 bg-slate-300" />

            <Switch
              checked={showFormState}
              label="Show formState"
              onCheckedChange={() =>
                formState.handleChange('showFormState', !showFormState)
              }
            />

            {/* -- useFormstate() -- */}

            {showFormState && (
              <>
                <View className="h-4" />

                <H3>
                  <Link
                    className="text-primary no-underline"
                    href="https://fullproduct.dev/docs/form-management"
                    target="_blank"
                  >
                    {'formState = useFormState( zod )'}
                  </Link>
                </H3>

                <View className="h-2" />

                <Link
                  className="no-underline"
                  href="https://fullproduct.dev/docs/form-management"
                  target="_blank"
                >
                  📗 Read form-management docs
                </Link>

                <View className="h-4" />

                <Text className="text-start">
                  {JSON.stringify(
                    {
                      ...formState,
                      metadata: {
                        currentSetupHoursPerProject,
                        setupHoursPerProject,
                        learningGapHours,
                        annualHoursSaved,
                        annualAvgEfficiencyBoost,
                        isWeb,
                        deliveryEfficiency,
                        finalEfficiencyRate,
                        results,
                      },
                    },
                    null,
                    2
                  )}
                </Text>
              </>
            )}

            {inputScrollUtils.keyboardPaddedView}
          </View>
        </View>
      </ScrollView>
      <BackButton
        backLink="/subpages/Universal%20Nav"
        color={getThemeColor('--primary')}
      />
    </KeyboardAvoidingView>
  );
};

/* --- Documentation --------------------------------------------------------------------------- */

export const getDocumentationProps =
  FormScreenProps.documentationProps('FormScreen');

/* --- Exports --------------------------------------------------------------------------------- */

export default FormsScreen;
